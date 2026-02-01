
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

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

    // Trust proxy for Render, Heroku, and other cloud platforms
    if (isProduction) {
        app.set("trust proxy", 1);
    }

    const sessionSettings: session.SessionOptions = {
        secret: process.env.SESSION_SECRET || "nocturne_secret_key_12345",
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
            const { uid, email, displayName, photoURL } = req.body;
            if (!uid) return res.status(400).send("UID required");

            // In a real app, verify the ID token from Firebase Admin SDK here.
            // For this bridge implementation, we trust the client-side claim to bootstrap the session.

            // Strategy: 
            // 1. Try to find user by 'googleId' (Firebase UID)
            // 2. Try to find user by 'email'
            // 3. If not found, create new user

            let user = await storage.getUserByGoogleId(uid);

            if (!user && email) {
                user = await storage.getUserByEmail(email);

                // If found by email but no googleId, update the user to link googleId?
                // For now, let's just log them in. 
                // Ideally we should update the googleId, but IStorage doesn't have updateUser yet except upsert (which throws error in DBStorage).
                // Let's rely on login.
            }

            if (!user) {
                // Determine username: email or uid or possibly a slugified name?
                // We use email || uid to be safe.
                const username = email || uid;

                // Check if username is taken (rare edge case if it differs from email lookup)
                const existingUserByName = await storage.getUserByUsername(username);

                let safeUsername = username;
                if (existingUserByName) {
                    // This is a conflict. We found a user by username, but not by GoogleId or Email (implied).
                    // This implies 'username' column has 'email' value, but 'email' column is empty?
                    // Or we are trying to set username to something that exists.
                    // Handle by appending random string
                    const randomSuffix = randomBytes(4).toString('hex');
                    // We modify the username to be unique
                    safeUsername = `${username}_${randomSuffix}`;
                }

                // Create a random password for local strategy fallback
                const randomPwd = await hashPassword(randomBytes(16).toString('hex'));

                user = await storage.createUser({
                    username: safeUsername!,
                    password: randomPwd,
                    googleId: uid,
                    displayName: displayName || "Nocturne User",
                    email: email,
                    profileImageUrl: photoURL
                });
            }

            // Establish local session
            req.login(user, (err) => {
                if (err) return next(err);
                return res.json(user);
            });

        } catch (error) {
            next(error);
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
            done(null, user);
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

    app.get("/api/user", async (req, res) => {
        if (!req.isAuthenticated() || !req.user) return res.sendStatus(401);

        try {
            // Fetch fresh user data from database instead of using cached session data
            const freshUser = await storage.getUser(req.user.id);
            res.json(freshUser);
        } catch (error) {
            console.error("Error fetching user:", error);
            // Fallback to session user if database fetch fails
            res.json(req.user);
        }
    });
}
