import { randomBytes } from "crypto";

let jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  if (process.env.NODE_ENV === "production") {
    console.warn(
      "⚠️ [SECURITY WARNING]: JWT_SECRET is not set in production environment variables! " +
      "Generated an ephemeral cryptographically secure 256-bit secret for this instance. " +
      "To persist mobile login tokens across server deploys and restarts, set JWT_SECRET in your dashboard (e.g. Render Dashboard -> Environment)."
    );
    jwtSecret = randomBytes(32).toString("hex");
  } else {
    jwtSecret = "nocturne-mobile-secret-change-in-prod";
  }
}

export const JWT_SECRET = jwtSecret;
export const JWT_EXPIRES_IN = "30d";
