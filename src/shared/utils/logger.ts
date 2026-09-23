type LogMeta = Record<string, unknown>;

const SENSITIVE_KEY_PATTERN = /password|secret|token|authorization|cookie|credential|api[-_]?key/i;

function redact(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redact);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [
        key,
        SENSITIVE_KEY_PATTERN.test(key) ? "[REDACTED]" : redact(nestedValue),
      ]),
    );
  }

  return value;
}

function writeLog(level: "debug" | "error" | "info" | "warn", message: string, meta?: LogMeta): void {
  if (level === "debug" && process.env.NODE_ENV === "production") {
    return;
  }

  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(meta ? { meta: redact(meta) } : {}),
  };

  const line = `${JSON.stringify(entry)}\n`;

  if (level === "error") {
    process.stderr.write(line);
    return;
  }

  process.stdout.write(line);
}

export const logger = {
  info(message: string, meta?: LogMeta): void {
    writeLog("info", message, meta);
  },

  warn(message: string, meta?: LogMeta): void {
    writeLog("warn", message, meta);
  },

  error(message: string, meta?: LogMeta): void {
    writeLog("error", message, meta);
  },

  debug(message: string, meta?: LogMeta): void {
    writeLog("debug", message, meta);
  },
};
