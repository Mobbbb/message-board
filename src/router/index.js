import { createRouter, createWebHashHistory } from 'vue-router'
import store from '@/store'

export const homeRoute = {
    path: '/',
    name: 'home',
    meta: {
        level: 0,
        name: '主页',
    },
    component: () => import('@/single-page/home/index.vue'),
}

export const incomeRoute = {
    path: '/income',
    name: 'income',
    meta: {
        level: 0,
        name: '收益',
    },
    component: () => import('@/single-page/income/index.vue'),
}

export const orderRoute = {
    path: '/order',
    name: 'order',
    meta: {
        level: 0,
        name: '交易',
    },
    component: () => import('@/single-page/order/index.vue'),
}

export const toolsRoute = {
    path: '/tools',
    name: 'tools',
    meta: {
        level: 0,
        name: '工具',
    },
    component: () => import('@/single-page/tools/index.vue'),
}

export const detailRoute = {
    path: '/detail',
    name: 'detail',
    meta: {
        level: 1,
        name: '详情',
    },
    component: () => import('@/single-page/detail/index.vue'),
}

export const notFoundRoute = {
    path: '/:pathMatch(.*)',
    meta: {
        level: -1,
    },
    component: () => import('@/single-page/not-found-page/index.vue'),
}

export const routes = [
    incomeRoute,
    orderRoute,
    toolsRoute,
    detailRoute,
    notFoundRoute,
]

export const privateRoute = [homeRoute]
export const privateRouteName = privateRoute.map(item => item.name)

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export const addPrivateRoute = (to) => {
    privateRoute.forEach(item => {
        if (!router.hasRoute(item.name)) {
            router.addRoute(item)
            if (to && to.path === router.currentRoute.value.fullPath) {
                router.replace(router.currentRoute.value.fullPath)
            }
        }
    })
}

export const removePrivateRoute = () => {
    privateRoute.forEach(item => {
        if (router.hasRoute(item.name)) {
            router.removeRoute(item.name)
        }
    })
}

export const clearPrivateRoute = () => {
    removePrivateRoute()
    const currentName = router.currentRoute.value.name
    if (privateRouteName.includes(currentName) || !currentName) {
        router.push({
            name: routes[0].name,
        })
    }
}

router.beforeEach((to, from, next) => {
    store.commit('app/updateActiveNavIndex', to.path)
    if (store.getters['app/isLogin']) {
        addPrivateRoute(to, from)
        next()
    } else {
        removePrivateRoute()
        if (privateRouteName.includes(to.name) || !to.name) {
            next({
                name: routes[0].name,
            })
        } else {
            next()
        }
    }
})

export default router
