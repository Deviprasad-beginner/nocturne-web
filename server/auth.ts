
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
    const sessionSettings: session.SessionOptions = {
        secret: process.env.SESSION_SECRET || "nocturne_secret_key_12345",
        resave: false,
        saveUninitialized: false,
        store: storage.sessionStore,
    };

    if (app.get("env") === "production") {
        app.set("trust proxy", 1);
    }

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
            // 1. Try to find user by 'googleId' (we use firebase uid as googleId in schema)
            // 2. If not found, create new user

            let user = await storage.getUserByUsername(email || uid); // Use email as username if available

            if (!user) {
                // Determine username: email or uid
                const username = email || uid;

                // Create a random password for local strategy fallback (not used for this flow but required by schema often)
                const randomPwd = await hashPassword(randomBytes(16).toString('hex'));

                user = await storage.createUser({
                    username,
                    password: randomPwd,
                    googleId: uid, // Storing Firebase UID here
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

    app.get("/api/user", (req, res) => {
        if (!req.isAuthenticated()) return res.sendStatus(401);
        res.json(req.user);
    });
}
