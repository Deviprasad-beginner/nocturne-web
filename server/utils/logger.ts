/**
 * Simple logger utility
 * Can be extended to use Winston or other logging libraries
 */

type LogLevel = "info" | "warn" | "error" | "debug";

class Logger {
    private isDevelopment = process.env.NODE_ENV !== "production";

    private formatMessage(level: LogLevel, message: string, meta?: any): string {
        const timestamp = new Date().toISOString();
        const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
        return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
    }

    info(message: string, meta?: any) {
        console.log(this.formatMessage("info", message, meta));
    }

    warn(message: string, meta?: any) {
        console.warn(this.formatMessage("warn", message, meta));
    }

    error(message: string, error?: Error | any) {
        const meta = error instanceof Error ? { message: error.message, stack: error.stack } : error;
        console.error(this.formatMessage("error", message, meta));
    }

    debug(message: string, meta?: any) {
        if (this.isDevelopment) {
            console.debug(this.formatMessage("debug", message, meta));
        }
    }
}

export const logger = new Logger();
