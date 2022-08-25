import axios from 'axios'
import { ElMessage } from 'element-plus'

axios.defaults.withCredentials = true

class HttpRequest {
    constructor(baseUrl = '') {
        this.baseUrl = baseUrl
        this.queue = {}
    }

    getInsideConfig() {
        const config = {
            baseURL: this.baseUrl,
        }
        return config
    }

    destroy(url) {
        delete this.queue[url]
        // if (!Object.keys(this.queue).length) {}
    }

    interceptors(instance, url) {
        // 请求拦截
        instance.interceptors.request.use(config => {
            /* if (this.queue[url]) {
                this.queue[url]('取消重复请求')
            }
            config.cancelToken = new CancelToken(c => {
                this.queue[url] = c
            }) */

            // get 方法中可以添加Content-Type
            if (config.method === 'get') {
                config.data = true
            }
            return config
        }, error => {
            return Promise.reject(error).catch(e => {
                return { success: false }
            })
        })
        // 响应拦截
        instance.interceptors.response.use(res => {
            this.destroy(url)
            const { data } = res
            if (data.success === false) { // 服务器返回错误代码
                ElMessage.error(data.msg)
            }
            return data
        }, error => {
            this.destroy(url)
            // 浏览器返回错误代码，500、302...
            return Promise.reject(error).catch(e => {
                ElMessage.error('系统错误')
                return { success: false }
            })
        })
    }

    request(options) {
        const instance = axios.create({})
        options = Object.assign(this.getInsideConfig(), options)
        this.interceptors(instance, options.url)
        return instance(options)
    }
}
export default HttpRequest
