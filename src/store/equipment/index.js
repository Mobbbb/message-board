import { fetchDeleteEquipment, fetchAddEquipment, fetchEquipmentList } from '@/api/index'
import { ElMessage } from 'element-plus'

const equipment = {
    namespaced: true,
    state() {
        return {
            showEquipBtnStatus: false, // 显示装备按钮
            showConfigPanel: false, // 显示操作面板
            equipmentList: [], // 所有圣遗物列表
            activeEquipmentType: 'flower', // 当前激活的筛选类型
        }
    },
    getters: {
        showEquipmentList(state) { // 当前显示的圣遗物列表
            if (state.activeEquipmentType === 'all') {
                return state.equipmentList
            } else {
                return state.equipmentList.filter((item) => {
                    return item.type === state.activeEquipmentType
                })
            }
        },
        isSelectedAll(state, getters, rootState, rootGetters) { // 显示全选/反选按钮
            let selectedAllStatus = true
            let restArmorStatus = false
            const lockedArmorIdList = rootGetters['character/lockedArmorIdList']
            const { nature } = rootState.character.currentCharacter
            state.equipmentList.forEach(item => {
                if (!lockedArmorIdList.includes(item.id.toString())) {
                    if (item.type === 'cup') {
                        if (item.mainAttr.key === `elementRate${nature}` ||
                            item.mainAttr.key.indexOf('elementRate') === -1) {
                            if (!item.selected) selectedAllStatus = false
                        }
                    } else {
                        if (!item.selected) selectedAllStatus = false // 存在未被勾选的圣遗物
                    }
                    restArmorStatus = true // 存在空闲圣遗物
                }
            })
            // 存在空闲圣遗物 && 所有空闲圣遗物都已被勾选，全选按钮亮起
            return restArmorStatus && selectedAllStatus
        },
    },
    mutations: {
        /**
         * @description 全选/全不选所有空闲装备
         * @param {*} state
         * @param {*} status
         */
        selectAllEquipment(state, { status, lockedArmorIdList, currentNature }) {
            state.equipmentList.forEach(item => {
                // 过滤他人已装备的圣遗物
                if (!lockedArmorIdList.includes(item.id.toString())) {
                    // 过滤元素杯子
                    if (item.type === 'cup') {
                        // 仅勾选与自身对应元素属性的杯子 或 非元素属性的杯子
                        if (item.mainAttr.key === `elementRate${currentNature}` ||
                            item.mainAttr.key.indexOf('elementRate') === -1) {
                            item.selected = status
                        }
                    } else {
                        item.selected = status
                    }
                }
            })
        },
        /**
         * @description 增量勾选传入的圣遗物列表
         * @param {*} state
         * @param {*} idList
         */
        selectedEquipmentByIdList(state, idList = []) {
            state.equipmentList.forEach(item => {
                item.selected = false
                idList.forEach(cell => {
                    if (cell === item.id.toString()) {
                        item.selected = true
                    }
                })
            })
        },
        /**
         * @description 变更单体圣遗物勾选状态
         */
        changeSelectedStatusById(state, { id, status }) {
            state.equipmentList.forEach(item => {
                if (item.id === id) item.selected = status
            })
        },
        setEquipmentList(state, value) {
            state.equipmentList = value
        },
        setActiveEquipmentType(state, value) {
            state.activeEquipmentType = value
        },
        setShowEquipBtnStatus(state, status) {
            state.showEquipBtnStatus = status
        },
        changeShowConfigPanelStatus(state, status) {
            state.showConfigPanel = status
        },
    },
    actions: {
        async getEquipmentList({ commit, dispatch }) {
            const result = await fetchEquipmentList()
            const { data = [] } = result
            data.forEach(item => { item.selected = false })

            commit('setEquipmentList', data)
            dispatch('character/seArmorList', {}, { root: true }) // 勾选/穿戴服务器保存的圣遗物
        },
        async addEquipmentAction({ dispatch }, params) {
            const result = await fetchAddEquipment(params)
            if (result.success) {
                await dispatch('getEquipmentList')
                ElMessage.success('录入成功')
            }
            return result.success
        },
        async removeEquipmentAction({ dispatch }, item) {
            const result = await fetchDeleteEquipment(item.id)
            if (result.success) {
                await dispatch('getEquipmentList')
                ElMessage.success('删除成功')
            }
        },
        /**
         * @description 全选/全不选所有空闲装备
         * @param {*} param0
         */
        selectAllEquipmentHandle({ rootState, rootGetters, getters, commit }) {
            const lockedArmorIdList = rootGetters['character/lockedArmorIdList']
            const { nature } = rootState.character.currentCharacter
            commit('selectAllEquipment', {
                status: !getters.isSelectedAll,
                lockedArmorIdList,
                currentNature: nature,
            })
        },
    },
}

export default equipment
