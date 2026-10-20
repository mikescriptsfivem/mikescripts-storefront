import { env } from '../../config/env'
import { createTebexApi } from './api'

/** The shared API client, or null when no public token has been configured. */
export const tebexApi = env.isTebexConfigured ? createTebexApi(env.tebexPublicToken) : null
