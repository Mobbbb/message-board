import { ElMessage } from 'element-plus'
import { parseCharacterData, parseWeaponData, parseTeammateData, parseCoordinateData } from '@/libs/data-processing'
import { openDB } from 'idb'
import { fetchInsertLog } from '@/api'
import { getCurrentTime, getQueryVariable } from '@/libs/util'
import router from '@/router'

const version = require('package').version

export const goodsConfig = {
    eb: {
        num: 5,
        commission: 6,
        defaultPrice: 8000,
    },
    MA: {
        num: 10,
        commission: [4, 6],
        defaultPrice: 2500,
    }
}

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

            goods: {
                type: 'eb',
                lot: 1,
                pricePrev: goodsConfig.eb.defaultPrice,
                priceNext: goodsConfig.eb.defaultPrice,
            },
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
    },
    mutations: {
        setActiveTabName(state, value) {
            state.activeTabName = value
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
        setListData(state, value) {
            state.listData = value
        },
        setOriginData(state, value) {
            state.originData = value
        },
        updateActiveNavIndex(state, value) {
            state.activeNavIndex = value
        },
        setLoginDrawerStatus(state, status) {
            state.showLoginDrawerStatus = status
        },
        setCalcResultStatus(state, status) {
            state.showCalcResultStatus = status
        },
        setShowCharacterPanel(state, status) {
            state.showCharacterPanel = status
        },
        setAppPromptEvent(state, event) {
            state.installConfig.appPromptEvent = event
        },
        setInstallBtnShowStatus(state, status) {
            state.installConfig.showInstall = status
        },
        setIndexedDB(state, db) {
            state.indexedDB = db
        },
        setComputedCount(state, value) {
            state.computedCount = value
        },
        reduceComputedCount(state) {
            state.computedCount--
        },
        SET_USER_INFO(state, value) {
            state.USER_INFO = value
        },
        SET_CHARACTERS(state, params) {
            const { CHARACTERS, CHARACTERS_OBJ, EDITABLE_ARR } = params
            state.CHARACTERS = CHARACTERS
            state.CHARACTERS_OBJ = CHARACTERS_OBJ
            state.CHARACTERS_EDITABLE_ARR = EDITABLE_ARR
        },
        SET_LOCK_PROPERTY(state, params) {
            state.CHARACTERS.forEach(item => {
                params.forEach(cell => {
                    if (item.name === cell.characterName) {
                        item.locked = cell.locked
                        item.lockId = cell.id
                    }
                })
            })
        },
        SET_CHARACTERS_BY_INDEX(state, params) {
            const { skill, property, modelIndex, modelPropertyIndex, value, key } = params
            const { index, name } = skill
            const { propertyIndex, skillIndex, skillKey } = property
            state.CHARACTERS[index][skillKey][skillIndex].property[propertyIndex][key] = value
            state.CHARACTERS_OBJ[name][skillKey][skillIndex].property[propertyIndex][key] = value
            state.CHARACTERS_EDITABLE_ARR[modelIndex].property[modelPropertyIndex][key] = value
        },
        SET_COORDINATES(state, params) {
            const { COORDINATES, COORDINATES_OBJ, EDITABLE_ARR } = params
            state.COORDINATES = COORDINATES
            state.COORDINATES_OBJ = COORDINATES_OBJ
            state.COORDINATES_EDITABLE_ARR = EDITABLE_ARR
        },
        SET_COORDINATES_BY_INDEX(state, params) {
            const { item, propertyIndex, modelIndex, modelPropertyIndex, value, key } = params
            const { index, coordinatedKey, value: keyValue } = item
            state.COORDINATES[index][coordinatedKey][propertyIndex][key] = value
            state.COORDINATES_OBJ[keyValue][coordinatedKey][propertyIndex][key] = value
            state.COORDINATES_EDITABLE_ARR[modelIndex].property[modelPropertyIndex][key] = value
        },
        SET_WEAPONS(state, params) {
            const { WEAPONS, WEAPONS_OBJ, EDITABLE_ARR } = params
            state.WEAPONS = WEAPONS
            state.WEAPONS_OBJ = WEAPONS_OBJ
            state.WEAPONS_EDITABLE_ARR = EDITABLE_ARR
        },
        SET_WEAPONS_BY_INDEX(state, params) {
            const { index, propertyIndex, name, modelIndex, modelPropertyIndex, value, key } = params
            state.WEAPONS[index].secondaryAttr[propertyIndex][key] = value
            state.WEAPONS_OBJ[name].secondaryAttr[propertyIndex][key] = value
            state.WEAPONS_EDITABLE_ARR[modelIndex].property[modelPropertyIndex][key] = value
        },
        SET_TEAMMATE(state, params) {
            const { TEAMMATE, TEAMMATE_OBJ, EDITABLE_ARR } = params
            state.TEAMMATE = TEAMMATE
            state.TEAMMATE_OBJ = TEAMMATE_OBJ
            state.TEAMMATE_EDITABLE_ARR = EDITABLE_ARR
        },
        SET_TEAMMATE_BY_INDEX(state, params) {
            const { index, propertyIndex, name, modelIndex, modelPropertyIndex, value, key } = params
            state.TEAMMATE[index].secondaryAttr[propertyIndex][key] = value
            state.TEAMMATE_OBJ[name].secondaryAttr[propertyIndex][key] = value
            state.TEAMMATE_EDITABLE_ARR[modelIndex].property[modelPropertyIndex][key] = value
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
        /**
         * @description 1-1、获取json数据，角色、武器、圣遗物套装效果、队友信息
         * @param {*} param0
         */
        async GET_JSON_DATA({ commit, dispatch }) {
            let result = {}
            const db = await openDB('JSONData', 1, {
                upgrade(db) {
                    const store = db.createObjectStore('data', { keyPath: 'id' })
                    store.createIndex('id', 'id')
                },
            })
            commit('setIndexedDB', db)

            const indexResult = await db.transaction('data', 'readwrite').store.index('id').get(version)
            if (indexResult) {
                result = indexResult.result // indexedDB获取数据
                dispatch('SET_JSON_DATA', result)
            } else {
                result = await fetchJsonData() // get请求获取数据
                if (result.success !== false) { // 成功获取数据
                    db.add('data', { id: version, result }) // 存储至indexedDB
                    dispatch('SET_JSON_DATA', result)
                }
            }
            // dispatch('SET_JSON_DATA', mock)
        },
        /**
         * @description 1-2、设置角色、武器、套装、辅助数据
         * @param {*} param0
         * @param {*} params
         */
        SET_JSON_DATA({ commit }, params) {
            const { CHARACTERS = [], WEAPONS = [], COORDINATES = [], TEAMMATE = [] } = params
            commit('SET_CHARACTERS', parseCharacterData(CHARACTERS))
            commit('SET_WEAPONS', parseWeaponData(WEAPONS))
            commit('SET_COORDINATES', parseCoordinateData(COORDINATES))
            commit('SET_TEAMMATE', parseTeammateData(TEAMMATE))
        },
        /**
         * @description 1-3、获取用户相关信息，设置默认属性
         * @param {*} param0
         */
        async INIT({ state, rootState, commit, dispatch }) {
            const userId = ''
            const localSelectedCharacter = localStorage.getItem('selectedCharacter')
            if (localSelectedCharacter && state.CHARACTERS_OBJ[localSelectedCharacter]) {
                commit('character/setCurrentCharacter', state.CHARACTERS_OBJ[localSelectedCharacter], { root: true })
            } else {
                commit('character/setCurrentCharacter', state.CHARACTERS[0] || {}, { root: true })
            }

            if (userId) { // 获取用户相关信息
                commit('SET_USER_INFO', { userId })
                await dispatch('equipment/getEquipmentList', {}, { root: true }) // 获取所有圣遗物
                await dispatch('character/getCEAndSelect', {}, { root: true }) // 获取角色-装备信息，并勾选
                commit('SET_LOCK_PROPERTY', rootState.character.CEList)
            }
            dispatch('SET_INIT_PROPERTY')
        },
        SET_INIT_PROPERTY({ commit, dispatch }) {
            // 重置所有属性，并设置人物基础属性
            commit('home/setBaseProperty', {}, { root: true })
            // 设置默认装备的武器/激活主动技能...
            dispatch('character/setDefaultInfo', {}, { root: true })
            // 设置当前保存的角色的圣遗物/武器/当前命座/当前武器加值
            dispatch('character/initCharacterInfo', {}, { root: true })
        },
        /**
         * @description 更新json数据，角色、武器、圣遗物套装效果、队友信息
         * @param {*} param0
         */
        async UPDATE_JSON_DATA({ state, rootState, commit, dispatch }) {
            const result = await fetchJsonData() // get请求获取数据
            if (result.success !== false) { // 成功获取数据
                state.indexedDB.put('data', { id: version, result }) // 存储至indexedDB
                dispatch('SET_JSON_DATA', result)
                commit('SET_LOCK_PROPERTY', rootState.character.CEList)
                ElMessage.success('角色/武器/圣遗物套装/队友信息更新成功')
            }
        },
        logoutAction({ commit, dispatch }) {
            commit('SET_USER_INFO', {})
            dispatch('INIT')
            commit('equipment/setEquipmentList', [], { root: true })
        },
    },
}

export default app
