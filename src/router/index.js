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
    homeRoute,
    incomeRoute,
    orderRoute,
    toolsRoute,
    detailRoute,
    notFoundRoute,
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

router.afterEach((to, from, failure) => {
    store.commit('app/updateActiveNavIndex', to.path)
})

export default router
