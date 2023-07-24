import path from 'path'
import { transports, format } from 'winston'
import expressWinston from 'express-winston'

const env = process.env.NODE_ENV === 'production'

const logFile = path.resolve(__dirname, '../log/logger.log')
const errorLogFile = path.resolve(__dirname, '../log/error-loger.log')

export const logger = expressWinston.logger(
  env
    ? {
        transports: [new transports.File({ filename: logFile })],
        format: format.simple(),
        meta: false,
        colorize: false,
      }
    : {
        transports: [new transports.Console()],
        format: format.combine(format.colorize(), format.simple()),
        meta: true,
        colorize: true,
      },
)

export const errorLogger = expressWinston.errorLogger(
  env
    ? {
        transports: [new transports.File({ filename: errorLogFile })],
        format: format.simple(),
        meta: false,
      }
    : {
        transports: [new transports.Console()],
        format: format.combine(format.colorize(), format.simple()),
        meta: true,
      },
)
