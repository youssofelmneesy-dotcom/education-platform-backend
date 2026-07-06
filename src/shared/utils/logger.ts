type LogMeta = Record<string, unknown>;

function formatMeta(meta?: LogMeta): string {
  return meta ? ` ${JSON.stringify(meta)}` : "";
}

export const logger = {
  info(message: string, meta?: LogMeta): void {
    console.info(`[INFO] ${message}${formatMeta(meta)}`);
  },

  warn(message: string, meta?: LogMeta): void {
    console.warn(`[WARN] ${message}${formatMeta(meta)}`);
  },

  error(message: string, meta?: LogMeta): void {
    console.error(`[ERROR] ${message}${formatMeta(meta)}`);
  },

  debug(message: string, meta?: LogMeta): void {
    if (process.env.NODE_ENV !== "production") {
      console.debug(`[DEBUG] ${message}${formatMeta(meta)}`);
    }
  },
};
