import morgan, { StreamOptions } from 'morgan'
import { logger } from './winston'

const stream: StreamOptions = {
  write: (message) => logger.http(message),
}

const skip = () => {
  const env = process.env.NODE_ENV || 'development'
  return env !== 'development'
}

export const httpLogger = morgan(':status :method :url - :res[content-length] - :response-time ms', { stream, skip })
