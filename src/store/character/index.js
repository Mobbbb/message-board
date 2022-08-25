import { fetchCharacterInfo, fetchChangeCharacter, fetchLockEquipment } from '@/api/index'
import { REACTION_COEFFICIENT, FIRE_REACTION_COEFFICIENT } from '@/config/constant'
import { ElMessage } from 'element-plus'

const equipment = {
    namespaced: true,
    state() {
        return {
            CEList: [], // 所有角色的装备信息(服务器)
            charArmorIdList: [], // 当前角色装备的圣遗物id集合(页面)

            currentWeapon: {}, // 当前装备的武器
            currentCharacter: {}, // 当前的角色
            currentWeaponLevel: 1, // 当前武器加值
            currentActiveSkills: {}, // 当前激活的主动技能
            currentDamageNature: '', // 当前的伤害属性
            currentDuplicateNum: 0, // 当前命座
        }
    },
    getters: {
        currentCharacterInfo(state) { // 当前角色圣遗物/武器/命座信息(服务器)
            const { name } = state.currentCharacter
            return state.CEList.filter(item => item.characterName === name)[0] || {}
        },
        originCharArmorIdList(state, getters) { // 当前角色装备的圣遗物id集合(服务器)
            return getters.currentCharacterInfo.equipmentList || []
        },
        allCurrentCharArmorIdList(state) { // 所有角色装备的圣遗物id集合(页面)
            let resultList = []
            const { name } = state.currentCharacter
            state.CEList.forEach(item => {
                if (item.characterName !== name) {
                    resultList = resultList.concat(item.equipmentList)
                }
            })
            resultList = resultList.concat(state.charArmorIdList)
            return [...new Set(resultList)]
        },
        allOriginCharArmorIdList(state) { // 所有角色装备的圣遗物id集合(服务器)
            let resultList = []
            state.CEList.forEach(item => {
                resultList = resultList.concat(item.equipmentList)
            })
            return [...new Set(resultList)]
        },
        lockedArmorIdList(state) { // 所有被锁定的的圣遗物id集合(服务器)
            let resultList = []
            state.CEList.forEach(item => {
                if (item.locked) {
                    resultList = resultList.concat(item.equipmentList)
                }
            })
            return [...new Set(resultList)]
        },
        currentDuplicateNumSkills(state) { // 当前生效的命座buff
            const { duplicateNumSkills } = state.currentCharacter
            return duplicateNumSkills.filter(item => state.currentDuplicateNum >= item.index)
        },
        activePassiveSkills(state) { // 当前激活的被动技能
            const { passiveSkills } = state.currentCharacter
            return passiveSkills.filter(item => {
                // 返回激活的被动技能，命座buff生效条件不小于当前命座
                const { index = -1 } = item
                return item.actived && state.currentDuplicateNum >= index
            })
        },
        activePassiveSkillsNames(state, getters) { // 当前激活的被动技能名称集合
            return getters.activePassiveSkills.map(item => item.name)
        },
        availableWeapons(state, getters, rootState) {
            const { weaponType } = state.currentCharacter
            if (weaponType) {
                return rootState.app.WEAPONS.filter(item => item.type === weaponType)
            }
            return rootState.app.WEAPONS
        },
        availableReaction(state) {
            return REACTION_COEFFICIENT.filter(item => item.nature === state.currentDamageNature)
        },
        availableTeammateLists(state, getters, rootState) {
            return rootState.app.TEAMMATE.filter(item => item.name !== state.currentCharacter.name)
        },
        availableDamageNatureLists(state) {
            const typeArr = []
            const { damageNature = [] } = state.currentActiveSkills
            damageNature.forEach(item => {
                typeArr.push({
                    label: item === 'P' ? '物理伤害' : '元素伤害',
                    type: item,
                })
            })
            return typeArr
        },
    },
    mutations: {
        /**
         * @description 变更被动技能勾选状态
         * @param {*} state
         * @param {*} params
         */
        changePassiveSkillsStatus(state, params) {
            state.currentCharacter.passiveSkills.forEach(item => {
                if (item.name === params.name) {
                    item.actived = !item.actived
                }
            })
        },
        setCEList(state, value) {
            state.CEList = value
        },
        setCharArmorIdList(state, value) {
            state.charArmorIdList = value
        },
        changeHierarchyNumByIndex(state, { value, index }) {
            state.currentCharacter.activeSkills[index].hierarchyNum = value
        },
        setCurrentCharacter(state, value) {
            state.currentCharacter = value
        },
        setCurrentWeapon(state, value = {}) {
            state.currentWeapon = value
        },
        setCurrentWeaponLevel(state, value) {
            state.currentWeaponLevel = value
        },
        setCurrentActiveSkills(state, value) {
            state.currentActiveSkills = value
        },
        setCurrentDamageNature(state, value) {
            state.currentDamageNature = value
        },
        setCurrentDuplicateNum(state, value) {
            state.currentDuplicateNum = value
        },
    },
    actions: {
        async getCEAndSelect({ commit, dispatch }) {
            const result = await fetchCharacterInfo()
            const { data = [] } = result
            commit('setCEList', data) // 保存角色-装备信息
            dispatch('seArmorList') // 勾选/穿戴服务器保存的圣遗物
        },
        /**
         * @description 设置默认技能/技能伤害属性/默认武器
         * @param {*} param0
         */
        setDefaultInfo({ state, getters, commit, dispatch }) {
            const { activeSkills = [], weaponType = '' } = state.currentCharacter
            const defaultWeapon = getters.availableWeapons[0] || {}
            const defaultActiveSkills = activeSkills[0] || {}
            const { damageNature = [] } = defaultActiveSkills

            if (defaultActiveSkills) {
                commit('setCurrentActiveSkills', defaultActiveSkills)
                dispatch('changeCurrentDamageNature', damageNature[0])
            }
            if (defaultWeapon.type && weaponType !== state.currentWeapon.type) {
                commit('setCurrentWeapon', defaultWeapon)
            }
            // 切换角色时，火属性伤害技能默认设置蒸发反应，其他属性清空
            if (damageNature[0] === 'F') {
                commit('home/setSelectedReaction', FIRE_REACTION_COEFFICIENT, { root: true })
            } else {
                commit('home/setSelectedReaction', {}, { root: true })
            }
        },
        /**
         * @description 设置当前武器/当前命座/当前武器加值
         * @param {*} param0
         */
        initCharacterInfo({ rootState, getters, commit }) {
            const { weapon, duplicateNum = 0, weaponLevel = 1 } = getters.currentCharacterInfo
            commit('setCurrentDuplicateNum', duplicateNum)
            commit('setCurrentWeaponLevel', weaponLevel)
            if (weapon) commit('setCurrentWeapon', rootState.app.WEAPONS_OBJ[weapon])
        },
        /**
         * @description 保存角色的装备信息
         * @param {*} param0
         * @returns
         */
        async saveCharacterAction({ state, commit, dispatch }) {
            const { name: characterName } = state.currentCharacter
            const { name: weapon } = state.currentWeapon

            if (!characterName || !weapon) {
                ElMessage.error('请选择角色和武器')
                return
            }

            const fetchParams = {
                characterName,
                duplicateNum: state.currentDuplicateNum,
                weaponLevel: state.currentWeaponLevel,
                weapon,
                equipmentList: state.charArmorIdList,
            }
            const result = await fetchChangeCharacter(fetchParams)
            if (result.success) {
                await dispatch('getCEAndSelect')
                commit('equipment/setShowEquipBtnStatus', false, { root: true })
                ElMessage.success('保存成功')
            }
        },
        /**
         * @description 锁定/解锁角色的圣遗物装备
         * @param {*} param0
         * @param {*} params
         */
        async changeLockStatusAction({ state, commit, dispatch }, params) {
            await fetchLockEquipment(params)
            await dispatch('getCEAndSelect')
            commit('app/SET_LOCK_PROPERTY', state.CEList, { root: true })
        },
        changeCurrentDamageNature({ rootState, commit }, nature) {
            commit('setCurrentDamageNature', nature)
            // 切换技能属性时，若当前属性不符合已选中的反应，清空选中的反应
            if (nature !== rootState.home.selectedReaction.nature) {
                commit('home/setSelectedReaction', {}, { root: true })
            }
            // 火属性伤害技能默认设置蒸发反应，其他属性清空
            if (nature === 'F') {
                commit('home/setSelectedReaction', FIRE_REACTION_COEFFICIENT, { root: true })
            }
        },
        /**
         * @description 切换主动技能
         * @param {*} param0
         * @param {*} value
         */
        changeCurrentActiveSkills({ state, commit, dispatch }, value) {
            commit('setCurrentActiveSkills', value)
            // 切换技能时，若技能元素类型改变，重置选中的元素类型
            if (!value.damageNature.includes(state.currentDamageNature)) {
                dispatch('changeCurrentDamageNature', value.damageNature[0])
            }
        },
        /**
         * @description 装备/解除圣遗物
         * @param {*} state
         * @param {*} id
         */
        changeChaArmorItemById({ state, commit }, id) {
            let flag = false
            const equipmentList = []
            state.charArmorIdList.forEach(item => {
                if (item !== id.toString()) equipmentList.push(item)
                else flag = true
            })
            if (!flag) equipmentList.push(id.toString())

            commit('setCharArmorIdList', equipmentList)
        },
        /**
         * @description 勾选/穿戴服务器保存的圣遗物
         * @param {*} param0
         */
        seArmorList({ getters, commit }) {
            commit('setCharArmorIdList', getters.originCharArmorIdList) // 穿戴服务器保存的圣遗物
            commit('equipment/selectedEquipmentByIdList', getters.originCharArmorIdList, { root: true }) // 勾选服务器保存的圣遗物
        },
        /**
         * @description 重置装备的圣遗物为服务器状态
         * @param {*} param0
         */
        resetChaArmorList({ getters, commit }) {
            commit('setCharArmorIdList', getters.originCharArmorIdList)
        },
    },
}

export default equipment
