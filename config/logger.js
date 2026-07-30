import winston from 'winston';
import path from 'path';

const BASE_DIR = process.cwd();

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    // defaultMeta: { service: 'user-service' },
    transports: [
        //
        // - Write all logs with importance level of `error` or higher to `error.log`
        //   (i.e., error, fatal, but not other levels)
        //
        new winston.transports.File({ filename: path.join(BASE_DIR, 'storage', 'logs', 'error.log'), level: 'error' }),
        //
        // - Write all logs with importance level of `info` or higher to `combined.log`
        //   (i.e., fatal, error, warn, and info, but not trace)
        //
        new winston.transports.File({ filename: path.join(BASE_DIR, 'storage', 'logs', 'combined.log') }),
    ],
});

// module.exports = logger;

export default logger;

// If we're not in production then log to the `console` with the format: