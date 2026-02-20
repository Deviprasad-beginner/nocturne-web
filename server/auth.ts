
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { logger } from "./utils/logger";

declare global {
    namespace Express {
        interface User extends SelectUser { }
    }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
    const isProduction = app.get("env") === "production" || process.env.NODE_ENV === "production";

    // Validate required secrets at startup
    if (!process.env.SESSION_SECRET) {
        if (isProduction) {
            throw new Error("FATAL: SESSION_SECRET environment variable is required in production");
        }
        logger.warn("SESSION_SECRET not set — using insecure default. Set it in .env for production.");
    }

    // Trust proxy for Render, Heroku, and other cloud platforms
    if (isProduction) {
        app.set("trust proxy", 1);
    }

    const sessionSettings: session.SessionOptions = {
        secret: process.env.SESSION_SECRET || "dev_only_insecure_secret_do_not_use_in_prod",
        resave: false,
        saveUninitialized: false,
        store: storage.sessionStore,
        cookie: {
            // Secure cookies for production (HTTPS only)
            secure: isProduction,
            // HttpOnly prevents XSS attacks
            httpOnly: true,
            // SameSite prevents CSRF attacks
            // 'none' allows cross-site cookies (needed if frontend/backend on different domains)
            // 'lax' is safer if they're on the same domain
            sameSite: isProduction ? 'none' : 'lax',
            // Cookie expiration - 7 days
            maxAge: 7 * 24 * 60 * 60 * 1000,
            // Path where cookie is valid
            path: '/',
        },
    };

    app.use(session(sessionSettings));
    app.use(passport.initialize());
    app.use(passport.session());

    app.post("/api/auth/firebase", async (req, res, next) => {
        try {
            const { idToken, uid, email, displayName, photoURL } = req.body;
            if (!uid) return res.status(400).send("UID required");

            // Verify Firebase ID token server-side if possible
            let verifiedUid = uid;
            let verifiedEmail = email ? email.toLowerCase() : null; // Enforce lowercase email

            try {
                // Phase 1: Try to initialize Firebase Admin if not already done
                const admin = await import("firebase-admin").then(m => m.default).catch(() => null);

                if (admin) {
                    if (!admin.apps.length) {
                        try {
                            // First, check for service account as a JSON string in environment variable
                            // This is the preferred way for hosting platforms like Render/Vercel
                            if (process.env.FIREBASE_SERVICE_ACCOUNT) {
                                const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
                                admin.initializeApp({
                                    credential: admin.credential.cert(serviceAccount)
                                });
                                logger.info("Firebase Admin initialized via FIREBASE_SERVICE_ACCOUNT env var");
                            }
                            // Fallback to the local file path if specified
                            else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
                                admin.initializeApp({
                                    credential: admin.credential.applicationDefault()
                                });
                                logger.info("Firebase Admin initialized via GOOGLE_APPLICATION_CREDENTIALS file path");
                            }
                            // Last resort: simple initialization (may fail if credentials aren't found in env)
                            else {
                                admin.initializeApp();
                                logger.info("Firebase Admin initialized with default credentials");
                            }
                        } catch (initErr: any) {
                            logger.warn("Firebase Admin initialization failed, proceeding with limited functionality:", initErr.message);
                        }
                    }

                    // Phase 2: Verify ID Token if provided
                    if (idToken && admin.apps.length) {
                        const decodedToken = await admin.auth().verifyIdToken(idToken);
                        verifiedUid = decodedToken.uid;
                        verifiedEmail = decodedToken.email ? decodedToken.email.toLowerCase() : verifiedEmail;
                        logger.info("Firebase ID token verified server-side");
                    } else if (!idToken) {
                        logger.warn("No idToken provided in request — trusting client-side Firebase UID (Insecure).");
                    }
                } else {
                    logger.warn("firebase-admin not installed — trusting client-side Firebase UID. Install firebase-admin for production security.");
                }
            } catch (verifyError: any) {
                logger.error("Firebase token verification failed", verifyError);
                return res.status(401).json({ error: "Invalid Firebase token" });
            }

            // Strategy: 
            // 1. Try to find user by 'googleId' (Firebase UID)
            // 2. Try to find user by 'email'
            // 3. If not found, create new user (handle race conditions)

            let user = await storage.getUserByGoogleId(verifiedUid);

            if (!user && verifiedEmail) {
                user = await storage.getUserByEmail(verifiedEmail);

                // If found by email but no googleId (or different one?), ensure googleId is set later if needed.
                // For now, if we match by email, we log them in.
                if (user && !user.googleId) {
                    // Ideally update the user to link googleId here.
                    // storage.updateUser(user.id, { googleId: verifiedUid }); 
                }
            }

            if (!user) {
                // Determine username: email or uid or possibly a slugified name?
                // We use email part or uid to be safe.
                const baseUsername = (verifiedEmail ? verifiedEmail.split('@')[0] : uid).toLowerCase().replace(/[^a-z0-9]/g, '');

                // Check if username is taken (rare edge case if it differs from email lookup)
                // We'll just generate a unique one to be safe
                const randomSuffix = randomBytes(4).toString('hex');
                const safeUsername = `${baseUsername}_${randomSuffix}`;

                // Create a random password for local strategy fallback
                const randomPwd = await hashPassword(randomBytes(16).toString('hex'));

                try {
                    user = await storage.createUser({
                        username: safeUsername,
                        password: randomPwd,
                        googleId: verifiedUid,
                        displayName: displayName || "Nocturne User",
                        email: verifiedEmail, // Use the verified, lowercased email
                        profileImageUrl: photoURL
                    });
                } catch (createError: any) {
                    // Handle potential race condition where user was created between lookup and insert
                    // OR unique constraint violation on email/googleId
                    logger.warn("User creation failed, checking for existing user...", createError.message);

                    // Retry lookup
                    user = await storage.getUserByGoogleId(verifiedUid);
                    if (!user && verifiedEmail) {
                        user = await storage.getUserByEmail(verifiedEmail);
                    }

                    if (!user) {
                        // If still no user, it's a genuine error
                        logger.error("Failed to recover from user creation error", createError);
                        throw createError;
                    }
                }
            }

            // Establish local session
            req.login(user, (err) => {
                if (err) return next(err);
                return res.json(user);
            });

        } catch (error) {
            console.error("Auth Error:", error); // Log full error on server
            next(error); // Pass to error handler
        }
    });

    passport.use(
        new LocalStrategy(async (username, password, done) => {
            try {
                const user = await storage.getUserByUsername(username);
                if (!user || !user.password || !(await comparePasswords(password, user.password))) {
                    return done(null, false);
                } else {
                    return done(null, user);
                }
            } catch (error) {
                return done(error);
            }
        }),
    );

    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id: number, done) => {
        try {
            const user = await storage.getUser(id);
            done(null, user || false);
        } catch (error) {
            done(error);
        }
    });

    app.post("/api/register", async (req, res, next) => {
        try {
            const existingUser = await storage.getUserByUsername(req.body.username);
            if (existingUser) {
                return res.status(400).send("Username already exists");
            }

            const hashedPassword = await hashPassword(req.body.password);
            const user = await storage.createUser({
                ...req.body,
                password: hashedPassword,
            });

            req.login(user, (err) => {
                if (err) return next(err);
                res.status(201).json(user);
            });
        } catch (error) {
            next(error);
        }
    });

    app.post("/api/login", passport.authenticate("local"), (req, res) => {
        res.status(200).json(req.user);
    });

    app.post("/api/logout", (req, res, next) => {
        req.logout((err) => {
            if (err) return next(err);
            res.sendStatus(200);
        });
    });

    app.get("/api/user", (req, res) => {
        if (!req.isAuthenticated() || !req.user) return res.sendStatus(401);

        // Serve the successfully identified user straight from the session (populated by passport's `deserializeUser` from the database already)
        res.json(req.user);
    });
}
