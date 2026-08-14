import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

const _pino = pino({
    level: process.env.LOG_LEVEL ?? (isDev ? "debug" : "info"),
    ...(isDev
        ? {
            transport: {
                target: "pino-pretty",
                options: {
                    colorize: true,
                    translateTime: "SYS:HH:MM:ss",
                    ignore: "pid,hostname",
                },
            },
        }
        : {}),
});

/**
 * Structured logger using pino.
 * - Development: pretty-printed, human-readable output with colours.
 * - Production: newline-delimited JSON (NDJSON) — ideal for log aggregators
 *   such as Datadog, Loki, or Render's built-in log stream.
 *
 * Exposes a compatible API with the previous console-wrapper so existing
 * call sites (logger.error("msg", err)) work without changes.
 */
export const logger = {
    info: (message: string, meta?: unknown) =>
        meta !== undefined
            ? _pino.info({ meta }, message)
            : _pino.info(message),

    warn: (message: string, meta?: unknown) =>
        meta !== undefined
            ? _pino.warn({ meta }, message)
            : _pino.warn(message),

    /** Accepts legacy (message, error) order used across the codebase. */
    error: (message: string, error?: unknown) => {
        if (error instanceof Error) {
            _pino.error({ err: error }, message);
        } else if (error !== undefined) {
            _pino.error({ meta: error }, message);
        } else {
            _pino.error(message);
        }
    },

    debug: (message: string, meta?: unknown) =>
        meta !== undefined
            ? _pino.debug({ meta }, message)
            : _pino.debug(message),

    /** Expose the underlying pino instance for pino-http */
    child: _pino.child.bind(_pino),
    /** For pino-http compatibility */
    _pino,
};

export type AppLogger = typeof logger;
