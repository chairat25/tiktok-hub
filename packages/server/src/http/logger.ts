type LogFields = Record<string, unknown>;

function serializeError(error: unknown): LogFields {
  if (error instanceof Error) {
    return { errorName: error.name, errorMessage: error.message, stack: error.stack };
  }
  return { error: String(error) };
}

function write(level: 'info' | 'warn' | 'error', event: string, fields: LogFields): void {
  const line = JSON.stringify({ level, event, time: new Date().toISOString(), ...fields });
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.info(line);
}

/**
 * Structured server-side logger. Callers must not pass secrets, tokens,
 * passwords, or full request bodies.
 */
export const logger = {
  info: (event: string, fields: LogFields = {}) => write('info', event, fields),
  warn: (event: string, fields: LogFields = {}) => write('warn', event, fields),
  error: (event: string, error: unknown, fields: LogFields = {}) =>
    write('error', event, { ...fields, ...serializeError(error) }),
};
