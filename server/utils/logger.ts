import winston from 'winston';
import path from 'path';

const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize, json } = format;

// Define log directory and file paths
const logDir = path.join(process.cwd(), 'logs');

// Define log formats
const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
  const metadataStr = Object.keys(metadata).length 
    ? `\n${JSON.stringify(metadata, null, 2)}` 
    : '';
  return `[${timestamp}] ${level}: ${message}${metadataStr}`;
});

// Create different transports for different environments
const developmentTransports = [
  new transports.Console({
    format: combine(
      colorize(),
      consoleFormat
    ),
  }),
];

const productionTransports = [
  new transports.Console({
    format: combine(
      colorize(),
      consoleFormat
    ),
  }),
  new transports.File({ 
    filename: path.join(logDir, 'error.log'), 
    level: 'error',
    format: combine(timestamp(), json()),
  }),
  new transports.File({ 
    filename: path.join(logDir, 'combined.log'),
    format: combine(timestamp(), json()),
  }),
];

// Create the logger
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json()
  ),
  defaultMeta: { service: 'api-service' },
  transports: process.env.NODE_ENV === 'production' 
    ? productionTransports 
    : developmentTransports,
  exceptionHandlers: [
    new transports.File({ 
      filename: path.join(logDir, 'exceptions.log'),
      format: combine(timestamp(), json()),
    }),
  ],
  exitOnError: false,
});

// Create a stream object for Morgan (HTTP request logging)
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

export default logger;