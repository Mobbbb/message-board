import HttpRequest from '@/libs/axios'
import config, { DEV } from '@/config'

const axios = config.env === DEV ? new HttpRequest('http://localhost:3001') : new HttpRequest()

export const prefixApi = config.env === DEV ? '' : '/api/blog'

export default axios
