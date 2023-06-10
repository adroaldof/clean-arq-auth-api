import morgan, { StreamOptions } from 'morgan'
import { logger } from './winston'
/* c8 ignore start */

const stream: StreamOptions = {
  write: (message) => logger.http(message),
}

const skip = () => {
  const env = process.env.NODE_ENV || 'development'
  return env !== 'development'
}

export const httpLogger = morgan(':status :method :url - :res[content-length] - :response-time ms', { stream, skip })
/* c8 ignore stop */
