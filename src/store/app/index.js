import { fetchFutureConfigInfo, fetchInsertLog, fetchUserInfo, fetchListData } from '@/api'
import { getCurrentTime, getQueryVariable, getCookie, delCookie } from '@/libs/util'
import router, { clearPrivateRoute } from '@/router'

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

            showLoginDrawerStatus: false,

            goods: {
                type: '',
                lot: 1,
                pricePrev: 0,
                priceNext: 0,
                commissionType: 0,
            },
            futureConfigInfo: [],
            USER_INFO: {}, // 用户信息
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
        isLogin(state) {
            return !!state.USER_INFO.userId
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
        setLoginDrawerStatus(state, value) {
            state.showLoginDrawerStatus = value
        },
        SET_USER_INFO(state, value) {
            state.USER_INFO = value
        },
    },
    actions: {
        async INIT_USER({ commit }) {
            const userId = getCookie('uid')
            if (userId) { // 获取用户相关信息
                commit('SET_USER_INFO', { userId })
                const res = await fetchUserInfo()
                const { data = {} } = res
                const { uid, avatar } = data
                if (uid) {
                    commit('SET_USER_INFO', {
                        userId: uid,
                        avatar,
                    })
                }
            }
        },
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
        },
        logoutAction({ commit }) {
            commit('SET_USER_INFO', {})
            delCookie('uid')
            delCookie('token')
            clearPrivateRoute()
        },
        async requestHomeList({ commit }) {
            let result = await fetchListData()
            
            if (result instanceof Array && result.length) {
                result.sort((a, b) => b.id - a.id)
                result.forEach((item, index) => {
                    item.index = index
                    if (item.htmlContent.indexOf('qzone/em') > -1) {
                        const splitStr = item.htmlContent.split('<img src="')
                        item.htmlContent = splitStr.join('<img src="//qzonestyle.gtimg.cn')
                    }
                    if (item.htmlContent.indexOf('&nbsp;<br  />') > -1) {
                        item.htmlContent = item.htmlContent.replace('&nbsp;<br  />', '<br  />')
                    }
                    if (item.htmlContent.indexOf('<br  />&nbsp;') > -1) {
                        item.htmlContent = item.htmlContent.replace('<br  />&nbsp;', '<br  />')
                    }
                })
                commit('setOriginData', JSON.parse(JSON.stringify(result)))
                commit('setListData', result)

                let obj = {}
                obj[window.version] = result
                localStorage.setItem('message-list', JSON.stringify(obj))
                return true
            }
            return false
        }
    },
}

export default app
