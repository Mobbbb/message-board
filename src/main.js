import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import App from './App.vue'
import router from './router'
import store from './store'
import './libs/index.js'
import './styles/index.css'
import './styles/media.css'

if (process.env.NODE_ENV !== 'production') {
    require('element-plus/dist/index.css')
}

const app = createApp(App)

app.use(ElementPlus, {
    locale: zhCn,
})
app.use(router)
app.use(store)

app.mount('#app')
