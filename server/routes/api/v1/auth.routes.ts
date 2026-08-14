/**
 * Mobile JWT Auth Routes
 * POST /api/v1/auth/token   — login, returns JWT
 * POST /api/v1/auth/register — register, returns JWT
 * POST /api/v1/auth/refresh  — refresh token
 */

import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../../../middleware/error.middleware";
import { storage } from "../../../storage";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "nocturne-mobile-secret-change-in-prod";
const JWT_EXPIRES_IN = "30d"; // 30 days — long-lived for mobile

async function hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
}

async function verifyPassword(supplied: string, stored: string): Promise<boolean> {
    if (!stored || typeof stored !== "string" || !stored.includes(".")) {
        return false;
    }
    const [hashed, salt] = stored.split(".");
    if (!hashed || !salt) return false;

    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
}

function signToken(userId: number, username: string): string {
    return jwt.sign({ sub: userId, username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * POST /api/v1/auth/token
 * Body: { username, password }
 * Returns: { token, user }
 */
router.post("/token", asyncHandler(async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username and password required" });
    }

    let user = await storage.getUserByUsername(username);
    if (!user && username.includes('@')) {
        user = await storage.getUserByEmail(username.toLowerCase());
    }

    if (!user || !user.password) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = signToken(user.id, user.username);

    return res.json({
        success: true,
        data: {
            token,
            user: {
                id: user.id,
                username: user.username,
                displayName: user.displayName,
                email: user.email,
            },
        },
    });
}));

/**
 * POST /api/v1/auth/register
 * Body: { username, password, email?, displayName? }
 * Returns: { token, user }
 */
router.post("/register", asyncHandler(async (req: Request, res: Response) => {
    const { username, password, email, displayName } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username and password required" });
    }

    if (password.length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const existing = await storage.getUserByUsername(username);
    if (existing) {
        return res.status(409).json({ success: false, message: "Username already taken" });
    }

    const hashed = await hashPassword(password);
    const user = await storage.createUser({
        username,
        password: hashed,
        email: email || null,
        displayName: displayName || username,
    });

    const token = signToken(user.id, user.username);

    return res.status(201).json({
        success: true,
        data: {
            token,
            user: {
                id: user.id,
                username: user.username,
                displayName: user.displayName,
                email: user.email,
            },
        },
    });
}));

/**
 * POST /api/v1/auth/refresh
 * Header: Authorization: Bearer <token>
 * Returns: { token } — fresh token with new expiry
 */
router.post("/refresh", asyncHandler(async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "No token provided" });
    }

    try {
        const token = authHeader.slice(7);
        const payload = jwt.verify(token, JWT_SECRET) as unknown as { sub: number; username: string };
        const newToken = signToken(payload.sub, payload.username);
        return res.json({ success: true, data: { token: newToken } });
    } catch {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
}));

export default router;
