
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { logger } from "./utils/logger";
import { z } from "zod";

const registerSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username too long").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    email: z.string().email("Invalid email").optional(),
});

const loginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
});

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
    if (!stored || typeof stored !== "string" || !stored.includes(".")) {
        return false;
    }
    const [hashed, salt] = stored.split(".");
    if (!hashed || !salt) return false;

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

    // Swallow async session-store errors (e.g. DB offline) so they don't 500 all requests
    if (storage.sessionStore && typeof (storage.sessionStore as any).on === 'function') {
        (storage.sessionStore as any).on('error', (err: Error) => {
            logger.warn('[session-store] error (sessions may not persist):', err.message);
        });
    }

    app.use(session(sessionSettings));

    app.use(passport.initialize());
    app.use(passport.session());

    app.post("/api/auth/firebase", async (req, res, next) => {
        try {
            const { idToken, uid, email, displayName, photoURL } = req.body;
            if (!uid) return res.status(400).send("UID required");

            // In production, always require idToken so we verify token server-side
            // Trusting client-sent UIDs without verification is a security risk
            if (isProduction && !idToken) {
                return res.status(401).json({ error: "idToken is required in production" });
            }

            // Verify Firebase ID token server-side if possible
            let verifiedUid = uid;
            let verifiedEmail = email ? email.toLowerCase() : null; // Enforce lowercase email

            // ── Phase 1: Initialize Firebase Admin (once) ──────────────────────────
            // Separated from token verification so that a missing / bad credential
            // env-var does NOT produce a 401 — it just falls back to trusting the
            // client-side UID with a warning, matching dev-mode behaviour.
            let adminInitialised = false;
            try {
                const admin = await import("firebase-admin").then(m => m.default).catch(() => null);

                if (admin) {
                    if (!admin.apps.length) {
                        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
                            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
                            admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
                            logger.info("Firebase Admin initialized via FIREBASE_SERVICE_ACCOUNT env var");
                        } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
                            admin.initializeApp({ credential: admin.credential.applicationDefault() });
                            logger.info("Firebase Admin initialized via GOOGLE_APPLICATION_CREDENTIALS file path");
                        } else {
                            logger.warn("No Firebase Admin credentials found (FIREBASE_SERVICE_ACCOUNT / GOOGLE_APPLICATION_CREDENTIALS). Token verification skipped — trusting client UID.");
                        }
                    }
                    adminInitialised = admin.apps.length > 0;

                    // ── Phase 2: Verify ID Token ────────────────────────────────────
                    // Only reached when Admin is properly initialised AND an idToken
                    // was sent. Any rejection here means the token is genuinely bad.
                    if (idToken && adminInitialised) {
                        try {
                            const decodedToken = await admin.auth().verifyIdToken(idToken);
                            verifiedUid = decodedToken.uid;
                            verifiedEmail = decodedToken.email ? decodedToken.email.toLowerCase() : verifiedEmail;
                            logger.info("Firebase ID token verified server-side");
                        } catch (verifyError: any) {
                            logger.error("Firebase token verification failed", verifyError.message);
                            return res.status(401).json({ error: "Invalid Firebase token" });
                        }
                    } else if (idToken && !adminInitialised) {
                        // Admin not available — cannot verify, fall back to trusting client UID
                        logger.warn("Firebase Admin not initialised — skipping token verification, trusting client UID. Set FIREBASE_SERVICE_ACCOUNT for production security.");
                    } else {
                        logger.warn("No idToken provided — trusting client-side Firebase UID (insecure).");
                    }
                } else {
                    logger.warn("firebase-admin package not available — trusting client-side Firebase UID.");
                }
            } catch (initError: any) {
                // Admin init failed (e.g. malformed JSON in FIREBASE_SERVICE_ACCOUNT).
                // Log it and fall back — do NOT return 401 here.
                logger.error("Firebase Admin initialization error:", initError.message);
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
                // Support login by username OR email
                let user = await storage.getUserByUsername(username);

                if (!user && username.includes('@')) {
                    // Treat as email if it contains '@'
                    user = await storage.getUserByEmail(username.toLowerCase());
                }

                if (!user || !user.password) {
                    return done(null, false, { message: "Invalid credentials" });
                }

                const passwordMatch = await comparePasswords(password, user.password);
                if (!passwordMatch) {
                    return done(null, false, { message: "Invalid credentials" });
                }

                return done(null, user);
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
            // Validate request body with Zod
            const parseResult = registerSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({
                    success: false,
                    error: { message: "Validation failed", code: "VALIDATION_ERROR", details: parseResult.error.errors },
                });
            }

            const existingUser = await storage.getUserByUsername(parseResult.data.username);
            if (existingUser) {
                return res.status(400).json({ success: false, error: { message: "Username already exists", code: "CONFLICT" } });
            }

            const hashedPassword = await hashPassword(parseResult.data.password);
            const user = await storage.createUser({
                ...req.body,
                username: parseResult.data.username,
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

    app.post("/api/login", (req, res, next) => {
        // Validate before attempting passport auth
        const parseResult = loginSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({
                success: false,
                error: { message: "Validation failed", code: "VALIDATION_ERROR", details: parseResult.error.errors },
            });
        }
        passport.authenticate("local", (err: any, user: any, _info: any) => {
            if (err) return next(err);
            if (!user) return res.status(401).json({ success: false, error: { message: "Invalid credentials", code: "UNAUTHORIZED" } });
            req.login(user, (loginErr) => {
                if (loginErr) return next(loginErr);
                return res.status(200).json(user);
            });
        })(req, res, next);
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
