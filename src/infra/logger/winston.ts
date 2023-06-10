import winston from 'winston'
/* c8 ignore start */

const { combine, timestamp, json, colorize, printf, errors } = winston.format

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
}

winston.addColors(colors)

const format = combine(
  timestamp(),
  colorize({ all: true }),
  printf((info) => `[${info.timestamp}] ${info.level} | ${info.message}`),
  errors({ stack: true }),
)

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: combine(errors({ stack: true }), timestamp(), json()),
  }),
  // new winston.transports.File({ filename: 'logs/all.log', format: combine(timestamp(), json()) }),
]

const level = () => {
  const env = process.env.NODE_ENV || 'development'
  const isDevelopment = env === 'development'
  return isDevelopment ? 'debug' : 'warn'
}

export const logger = winston.createLogger({
  levels,
  format,
  transports,
  level: level(),
})
/* c8 ignore stop */
