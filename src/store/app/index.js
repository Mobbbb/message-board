import { fetchFutureConfigInfo } from '@/api'
import { fetchInsertLog } from '@/api'
import { getCurrentTime, getQueryVariable } from '@/libs/util'
import router from '@/router'

const app = {
    namespaced: true,
    state() {
        return {
            navHeight: 60,
            mainGap: [32, 0, 8, 0],
            mainWidth: {
                width: 0.62,
                minWidth: 332,
            },
            mediaCriticalValue: 544, // 响应式临界尺寸
            listData: [],
            originData: [],
            activeNavIndex: '/',

            activeTabName: 'day',
            activeOrderTab: 'add',

            goods: {
                type: '',
                lot: 1,
                pricePrev: 0,
                priceNext: 0,
                commissionType: 0,
            },
            futureConfigInfo: [],
        }
    },
    getters: {
        mainStyle(state) {
            return {
                marginTop: `${state.mainGap[0]}px`,
                width: `${state.mainWidth.width * 100}%`,
                minWidth: `${state.mainWidth.minWidth}px`,
                height: `calc(100% - ${state.mainGap[0] + state.mainGap[2]}px)`,
            }
        },
        overMediaCritical(state) {
            return document.body.clientWidth < state.mediaCriticalValue
        },
        futuresList(state) { // 合约列表
            return [...new Set(state.futureConfigInfo.map(item => item.name))]
        },
    },
    mutations: {
        setFutureConfigInfo(state, value) {
            state.futureConfigInfo = value
        },
        setActiveTabName(state, value) {
            state.activeTabName = value
        },
        setActiveOrderTab(state, value) {
            state.activeOrderTab = value
        },
        setGoodsType(state, value) {
            state.goods.type = value
        },
        setGoodsLot(state, value) {
            state.goods.lot = value
        },
        setGoodsPricePrev(state, value) {
            state.goods.pricePrev = value
        },
        setGoodsPriceNext(state, value) {
            state.goods.priceNext = value
        },
        setCommissionType(state, value) {
            state.goods.commissionType = value
        },
        setListData(state, value) {
            state.listData = value
        },
        setOriginData(state, value) {
            state.originData = value
        },
        updateActiveNavIndex(state, value) {
            state.activeNavIndex = value
        },
    },
    actions: {
        async fetchInsertLogHandle({}, routerName) {
            if (location.hostname !== 'localhost' && getQueryVariable('log') !== '0') {
                await fetchInsertLog({
                    userAgent: navigator.userAgent,
                    createTime: getCurrentTime(),
                    routerName: routerName || router.currentRoute.value.path,
                })
            }
        },
        async getFutureConfigInfo({ commit }) {
            const res = await fetchFutureConfigInfo()
            const futureConfigInfo = res.data || []
            commit('setFutureConfigInfo', futureConfigInfo)
        }
    },
}

export default app
