import { createStore } from 'vuex'
import app from './app'

const store = createStore({
    // strict: process.env.NODE_ENV !== 'production',
    modules: {
        app,
    },
})

export default store
