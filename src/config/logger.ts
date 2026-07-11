import { createLogger, format, transports } from 'winston';
import { config } from './env';

export const logger = createLogger({
  level: config.log.level,
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    config.isProd ? format.json() : format.combine(format.colorize(), format.simple())
  ),
  transports: [new transports.Console()],
});
