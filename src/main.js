import { createApp } from 'vue'
import ElementPlus from 'element-plus'
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

app.use(ElementPlus)
app.use(router)
app.use(store)

app.mount('#app')
