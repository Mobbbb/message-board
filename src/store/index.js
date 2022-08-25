import { createStore } from 'vuex'
import app from './app'
import home from './home'
import equipment from './equipment'
import character from './character'

const store = createStore({
    // strict: process.env.NODE_ENV !== 'production',
    modules: {
        app, // 全局类信息
        home, // 计算类
        equipment, // 圣遗物列表类/增删改查
        character, // 角色相关类
    },
})

export default store
