import {
    addProperty, resetProperty, genFinalDamage,
    splitEquipmentList, rankTopFewList, judgeArmorCount,
} from '@/libs/data-processing'
import { MONSTER_PROPERTY } from '@/config/constant'
import { deepClone } from '@/libs/util'
import JobQueue from '@/libs/job-queue'

let cloneState = {}

const home = {
    namespaced: true,
    /**
     * @returns 只允许声明参与伤害计算的数值类属性!
     */
    state() {
        return {
            name: '', // 名称
            nature: '', // 元素属性
            weaponType: '', // 武器类型
            HP: 0, // 生命值
            ATK: 0, // 攻击力
            DEF: 0, // 防御力
            critRate: 0, // 暴击
            proportionalDamage: 0, // 爆伤
            HPPercent: 0, // 百分比生命值
            ATKPercent: 0, // 百分比攻击力
            DEFPercent: 0, // 百分比防御力
            elementRateF: 0, // 火元素伤害增伤
            elementRateW: 0, // 水元素伤害增伤
            elementRateI: 0, // 冰元素伤害增伤
            elementRateS: 0, // 土元素伤害增伤
            elementRateA: 0, // 风元素伤害增伤
            elementRateE: 0, // 雷元素伤害增伤
            elementRateP: 0, // 物理伤害增伤
            proficiency: 0, // 元素精通
            energyRate: 0, // 充能效率

            // 转换属性
            HPToATK: 0, // HP转ATK
            DEFToATK: 0, // 防御力转攻击力
            EnergyToE: 0, // 充能转雷伤
            EnergyToW: 0, // 充能转水伤
            EnergyToATK: 0, // 充能转攻击
            EnergyToDamageExtra: 0, // 充能转元素爆发伤害加成
            ProToDmaE: 0, // 精通转E技能伤害
            ATKToOriginalDamageExtra: 0, // 攻击力转原始伤害提高
            DEFToOriginalDamageExtra: 0, // 防御转原始伤害提高
            HPToOriginalDamageExtra: 0, // 生命值转原始伤害提高
            TreatmentToHPToOriginalDamageExtra: 0, // 治疗加成转生命值转原始伤害提高

            // 其他加成
            treatment: 0, // 治疗加成
            elementRate: 0, // 所有元素伤害增伤
            damageRateExtra: 0, // 所有伤害加成
            damageRateExtraA: 0, // 普攻伤害加成
            damageRateExtraN: 0, // 重击伤害加成
            damageRateExtraD: 0, // 下落伤害加成
            damageRateExtraE: 0, // 元素战技伤害加成
            damageRateExtraQ: 0, // 元素爆发伤害加成
            damageRateExtraAN: 0, // 普攻/重击伤害加成
            reactionRateExtra: 0, // 反应系数加成
            originalDamageExtra: 0, // 原始伤害加成
            reduceDefRate: 0, // 防御力减少
            extraMultiplyingRateA: 0, // 普攻技能倍率额外提升
            extraMultiplyingRateE: 0, // 元素战技技能倍率额外提升
            extraMultiplyingRateQ: 0, // 元素爆发技能倍率额外提升
            hierarchyRateQ: 0, // 元素爆发每层倍率
            critRateN: 0, // 重击暴击率增加
            critRateE: 0, // 元素战技暴击率增加
            critRateQ: 0, // 元素爆发暴击率增加

            // 抗性削减
            reduceResRate: 0, // 所有抗性减少
            reduceResRateEle: 0, // 所有元素抗性减少
            reduceResRateF: 0, // 火属性抗性减少
            reduceResRateW: 0, // 水属性抗性减少
            reduceResRateI: 0, // 冰属性抗性减少
            reduceResRateS: 0, // 土属性抗性减少
            reduceResRateA: 0, // 风属性抗性减少
            reduceResRateE: 0, // 雷属性抗性减少
            reduceResRateP: 0, // 物理属性抗性减少
            reduceResRatePI: 0, // 物理/冰属性抗性减少

            baseATK: 0, // 基础攻击
            baseHP: 0, // 基础HP
            baseDEF: 0, // 基础防御

            equipmentParams: {}, // 套装情况
            armorFilterConfig: {
                double: false,
                quadruple: false,
            },

            rankArmorList: [], // 圣遗物排名列表
            computedQueue: new JobQueue(),

            selectedTeammate: [], // 当前选择的队友
            selectedReaction: {}, // 当前选择的反应类型
            selectedTeamBuff: {}, // 当前选择的队伍元素共鸣情况
        }
    },
    getters: {
        finalDamageRateExtraA(state) {
            return state.damageRateExtraA + state.damageRateExtra + state.damageRateExtraAN
        },
        finalDamageRateExtraN(state) {
            return state.damageRateExtraN + state.damageRateExtra + state.damageRateExtraAN
        },
        finalDamageRateExtraD(state) {
            return state.damageRateExtraD + state.damageRateExtra
        },
        finalDamageRateExtraE(state) {
            return state.damageRateExtraE + state.damageRateExtra
        },
        finalDamageRateExtraQ(state) {
            return state.damageRateExtraQ + state.damageRateExtra
        },
        finalDamageRateExtra(state, getters, rootState) {
            const { type } = rootState.character.currentActiveSkills // 技能类型
            if (type) {
                return getters[`finalDamageRateExtra${type}`]
            }
            return 0
        },
        finallyElementRateF(state) {
            return state.elementRateF + state.elementRate
        },
        finallyElementRateW(state) {
            return state.elementRateW + state.elementRate
        },
        finallyElementRateI(state) {
            return state.elementRateI + state.elementRate
        },
        finallyElementRateS(state) {
            return state.elementRateS + state.elementRate
        },
        finallyElementRateA(state) {
            return state.elementRateA + state.elementRate
        },
        finallyElementRateE(state) {
            return state.elementRateE + state.elementRate
        },
        finallyElementRateP(state) {
            return state.elementRateP
        },
        finallyElementRate(state, getters, rootState) {
            const currentDamageNature = rootState.character.currentDamageNature // 伤害元素类型
            if (currentDamageNature) {
                return getters[`finallyElementRate${currentDamageNature}`]
            }
            return 0
        },
        finallyReduceResRateF(state) {
            return state.reduceResRateF + state.reduceResRateEle + state.reduceResRate
        },
        finallyReduceResRateW(state) {
            return state.reduceResRateW + state.reduceResRateEle + state.reduceResRate
        },
        finallyReduceResRateI(state) {
            return state.reduceResRateI + state.reduceResRatePI + state.reduceResRateEle + state.reduceResRate
        },
        finallyReduceResRateS(state) {
            return state.reduceResRateS + state.reduceResRateEle + state.reduceResRate
        },
        finallyReduceResRateA(state) {
            return state.reduceResRateA + state.reduceResRateEle + state.reduceResRate
        },
        finallyReduceResRateE(state) {
            return state.reduceResRateE + state.reduceResRateEle + state.reduceResRate
        },
        finallyReduceResRateP(state) {
            return state.reduceResRateP + state.reduceResRatePI + state.reduceResRate
        },
        _critRate_(state, getters, rootState) { // 最终暴击率
            const { type } = rootState.character.currentActiveSkills
            const extraCritRate = state[`critRate${type}`] || 0 // 暴击率额外提升
            const finalCritRate = extraCritRate + state.critRate

            if (finalCritRate > 100) {
                return 100
            } else if (finalCritRate < 0) {
                return 0
            }
            return finalCritRate // 暴击率
        },
        _originalDamage_(state, getters, rootState) { // 原始伤害, 技能倍率 * 倍率基于的属性
            const {
                multiplyingRate, // 面板技能倍率
                type, // 技能类型
                hierarchyNum = 0, // 技能叠加层数
                hierarchyRate = 0, // 每层倍率增加
                baseKey = 'ATK',
            } = rootState.character.currentActiveSkills
            let skillRate = multiplyingRate
            const extraMultiplyingRate = state[`extraMultiplyingRate${type}`] || 0 // 技能倍率额外提升

            if (hierarchyRate) { // 层数叠加类技能
                const extraHierarchyRate = state[`hierarchyRate${type}`] || 0 // 每层倍率增加额外增加
                skillRate += (hierarchyNum * (hierarchyRate + extraHierarchyRate))
            }
            skillRate += extraMultiplyingRate

            return state[baseKey] * skillRate / 100
        },
        _damageRateExtra_(state, getters) { // 增伤类，元素伤害 + 伤害增加
            return getters.finallyElementRate + getters.finalDamageRateExtra
        },
        _proficiencyRate_(state, getters, rootState) { // 元素反应倍率
            const {
                reactionRateExtra, // 反应系数加成
                proficiency, // 精通
                selectedReaction,
            } = state
            const {
                data, // 反应系数
                nature, // 技能的元素类型限制
            } = selectedReaction
            // 融化蒸发反应，计算精通加成
            if (nature === rootState.character.currentDamageNature) {
                return data * (1 + reactionRateExtra / 100 + proficiency * 278 / (proficiency + 1400) / 100)
            }
            return 1
        },
        _reduceResRate_(state, getters, rootState) { // 抗性增伤
            const {
                currentDamageNature, // 技能伤害类型
            } = rootState.character
            const reduceResRate = getters[`finallyReduceResRate${currentDamageNature}`] // 抗性减少

            // 抗性计算
            let resistanceRate = MONSTER_PROPERTY.resistanceRateMap[currentDamageNature] - reduceResRate / 100
            if (resistanceRate < 0) {
                resistanceRate = 1 - resistanceRate / 2
            } else if (resistanceRate >= 0.75) {
                resistanceRate = 1 / (1 + resistanceRate * 4)
            } else {
                resistanceRate = 1 - resistanceRate
            }

            return resistanceRate
        },
        _defenseRate_(state) { // 减防增伤
            return 950 / (950 +
                MONSTER_PROPERTY.DEF *
                (1 + MONSTER_PROPERTY.LEV / 100) *
                (1 - state.reduceDefRate / 100)
            )
        },
    },
    mutations: {
        unsetArmorProperty(state) {
            Object.keys(state).forEach(key => {
                // 重置数值类属性为装备圣遗物之前的状态
                if (typeof state[key] === 'number') {
                    state[key] = cloneState[key]
                }
            })
            // 重置圣遗物套装效果
            state.equipmentParams = {}
        },
        setBaseProperty(state, params) {
            resetProperty(state) // 重置所有属性

            // 设置人物初始属性
            Object.keys(params).forEach(key => {
                if (typeof state[key] !== 'undefined') state[key] = params[key]
            })

            state.baseATK = params.ATK
            state.baseHP = params.HP
            state.baseDEF = params.DEF
        },
        setWeaponProperty(state, params) {
            const { currentWeapon, currentWeaponLevel } = params
            const { ATK, secondaryAttr = [] } = currentWeapon
            state.ATK += ATK
            state.baseATK += ATK
            secondaryAttr.forEach(item => {
                const { levelRate, hierarchyNum, actived } = item
                if (actived === false) return

                const tempItem = deepClone(item)
                if (item.value instanceof Array) {
                    tempItem.value = item.value[currentWeaponLevel - 1] // 计算武器加值属性
                    if (tempItem.value instanceof Array) { // 计算武器buff叠加层数
                        tempItem.value = tempItem.value[hierarchyNum - 1] || 0
                    }
                    addProperty(tempItem, state)
                } else {
                    if (levelRate) { // 计算武器加值属性
                        tempItem.value += levelRate * (currentWeaponLevel - 1)
                    }
                    if (typeof hierarchyNum !== 'undefined') { // 计算武器buff叠加层数
                        tempItem.value = tempItem.value * hierarchyNum
                    }
                    addProperty(tempItem, state)
                }
            })
        },
        setEquipmentProperty(state, params) {
            addProperty(params.mainAttr, state)
            params.secondaryAttr.forEach(item => {
                addProperty(item, state)
            })
        },
        setTeammateSupEffect(state) {
            state.selectedTeammate.forEach(item => {
                const { secondaryAttr } = item
                secondaryAttr.forEach(cell => {
                    if (cell.actived === false) return
                    addProperty(cell, state)
                })
            })
        },
        setTeamBuffProperty(state) {
            const { property } = state.selectedTeamBuff
            if (property) addProperty(property, state)
        },
        /**
         * @description 转换类属性计算
         * @param {*} state
         */
        transformProperty(state) {
            // 突破转化
            state.HP += Math.round(state.baseHP * state.HPPercent / 100) // 角色突破生命值转换
            state.ATK += Math.round(state.baseATK * state.ATKPercent / 100) // 角色突破攻击力转换
            state.DEF += Math.round(state.baseDEF * state.DEFPercent / 100) // 角色突破防御力转换

            // 转元素爆发 - 基于充能
            let energyToDamageExtra = state.energyRate * state.EnergyToDamageExtra / 100 // 充能转元素爆发
            energyToDamageExtra = energyToDamageExtra > 75 ? 75 : energyToDamageExtra // 最高75伤转
            state.damageRateExtraQ += energyToDamageExtra // 充能转元素爆发(绝缘圣遗物套装效果)

            // 转攻击力 - 基于充能、生命值、防御力、基础攻击力
            let energyToATK = (state.energyRate - 100) * state.EnergyToATK / 100
            energyToATK = energyToATK > 80 ? 80 : energyToATK // 最高80伤转
            state.ATK += Math.round(state.baseATK * energyToATK / 100) // 充能转攻击(薙草之稻光)
            state.ATK += Math.round(state.HP * state.HPToATK / 100) // 血攻转换(胡桃、护膜)
            state.ATK += Math.round(state.DEF * state.DEFToATK / 100) // 防攻转换(女仆)

            // 转雷伤 - 基于充能(雷神)
            state.elementRateE = state.elementRateE.add(Math.floor((state.energyRate - 100) * state.EnergyToE) / 100)
            // 转水伤 - 基于充能(莫娜)
            state.elementRateW = state.elementRateW.add(Math.floor((state.energyRate - 100) * state.EnergyToW) / 100)
            // 转E技能伤害 - 基于精通(八重)
            state.damageRateExtraE += Math.round(state.ProToDmaE * state.proficiency)

            // 二转原始伤害 - 基于治疗加成(心海)
            state.HPToOriginalDamageExtra += Math.round(state.treatment *
                                                        state.TreatmentToHPToOriginalDamageExtra / 100)

            // 转原始伤害 - 基于攻击力、防御力
            state.originalDamageExtra += Math.round(state.DEF * state.DEFToOriginalDamageExtra / 100) // 防御转原始伤害
            state.originalDamageExtra += Math.round(state.ATK * state.ATKToOriginalDamageExtra / 100) // 攻击转原始伤害
            state.originalDamageExtra += Math.round(state.HP * state.HPToOriginalDamageExtra / 100) // 生命值转原始伤害
        },
        /**
         * @description 设置被动类技能加成
         * @param {*} state
         * @param {*} activePassiveSkills
         */
        setPassiveSkillsProperty(state, activePassiveSkills) {
            activePassiveSkills.forEach(item => {
                item.property.forEach(cell => {
                    if (typeof cell.hierarchyNum !== 'undefined') { // 层数buff类被动加成
                        const tempItem = deepClone(cell)
                        tempItem.value = tempItem.value * tempItem.hierarchyNum
                        addProperty(tempItem, state)
                    } else {
                        addProperty(cell, state)
                    }
                })
            })
        },
        /**
         * @description 设置命座加成
         * @param {*} state
         * @param {*} params
         */
        setDSkillsProperty(state, params) {
            const { currentDuplicateNumSkills, currentActiveSkills } = params
            const { index, type } = currentActiveSkills
            currentDuplicateNumSkills.forEach(item => {
                item.property.forEach(cell => {
                    if (typeof cell.hierarchyNum !== 'undefined') { // 层数buff类命座加成
                        const tempItem = deepClone(cell)
                        tempItem.value = tempItem.value * tempItem.hierarchyNum
                        addProperty(tempItem, state)
                    } else if (typeof cell.index !== 'undefined') { // 手动匹配对应的加成
                        if (cell.index === index && cell.skillType === type) {
                            addProperty(cell, state)
                        }
                    } else {
                        addProperty(cell, state)
                    }
                })
            })
        },
        /**
         * @description 设置套装属性
         * @param {*} state
         */
        setCoordinatesProperty(state, params) {
            Object.keys(state.equipmentParams).forEach(key => {
                if (state.equipmentParams[key] >= 2) {
                    params[key][2].forEach(item => {
                        addProperty(item, state)
                    })
                }
                if (state.equipmentParams[key] >= 4) {
                    params[key][4].forEach(item => {
                        addProperty(item, state)
                    })
                }
            })
        },
        /**
         * @description 统计套装情况
         * @param {*} state
         * @param {*} params
         */
        setEquipmentParams(state, params) {
            if (state.equipmentParams[params.value]) {
                state.equipmentParams[params.value]++
            } else {
                state.equipmentParams[params.value] = 1
            }
        },
        setArmorFilterConfig(state, { key, value }) {
            state.armorFilterConfig[key] = value
        },
        setSelectedTeammate(state, value) {
            state.selectedTeammate = value
        },
        setSelectedTeamBuff(state, value) {
            state.selectedTeamBuff = value || {}
        },
        setSelectedReaction(state, value) {
            state.selectedReaction = value || {}
        },
        setRankArmorList(state, value) {
            state.rankArmorList = value
        },
    },
    actions: {
        /**
         * @description 圣遗物排名计算
         * @param {*} param0
         * @param {*} type
         */
        async rankEquipment({ rootState, commit, dispatch }, type) {
            if (rootState.character.currentCharacter.name && rootState.character.currentWeapon.name) {
                const {
                    arr1 = [], arr2 = [], arr3 = [], arr4 = [], arr5,
                } = splitEquipmentList(rootState.equipment.equipmentList)

                dispatch('genProWithoutArmor')
                if (type) {
                    const totalCount = arr1.length * arr2.length * arr3.length * arr4.length * arr5.length
                    commit('app/setComputedCount', totalCount, { root: true })
                    setTimeout(() => { // 同步高速计算
                        dispatch('syncQueueComputed', { arr1, arr2, arr3, arr4, arr5 })
                    }, 100)
                } else {
                    dispatch('asyncQueueComputed', { arr1, arr2, arr3, arr4, arr5 }) // 延迟计算
                }
            }
        },
        /**
         * @description 计算装备圣遗物之前的属性
         */
        genProWithoutArmor({ state, rootState, rootGetters, commit }) {
            commit('setBaseProperty', rootState.character.currentCharacter) // 重置所有属性，并设置人物基础属性
            commit('setWeaponProperty', { // 设置武器属性
                currentWeapon: rootState.character.currentWeapon,
                currentWeaponLevel: rootState.character.currentWeaponLevel,
            })
            commit('setTeamBuffProperty') // 设置队友联合buff
            commit('setTeammateSupEffect') // 设置队友加成
            commit('setPassiveSkillsProperty', rootGetters['character/activePassiveSkills']) // 设置被动技能加成
            commit('setDSkillsProperty', { // 设置命座加成
                currentDuplicateNumSkills: rootGetters['character/currentDuplicateNumSkills'],
                currentActiveSkills: rootState.character.currentActiveSkills,
            })
            cloneState = deepClone(state) // 保存装备圣遗物之前的属性
        },
        async asyncQueueComputed({ state, getters, commit, dispatch }, { arr1, arr2, arr3, arr4, arr5 }) {
            const rankList = []
            arr1.forEach(flower => {
                arr2.forEach(feather => {
                    arr3.forEach(hourglass => {
                        arr4.forEach(cup => {
                            arr5.forEach(hat => {
                                if (judgeArmorCount([flower, feather, hourglass, cup, hat])) {
                                    state.computedQueue.addJob(() => {
                                        dispatch('setArmorProperty', [flower, feather, hourglass, cup, hat])
                                        rankTopFewList(rankList, {
                                            result: genFinalDamage(state, getters),
                                            armorList: [flower, feather, hourglass, cup, hat],
                                            proportionalDamage: state.proportionalDamage,
                                            critRate: getters._critRate_,
                                        })
                                        commit('unsetArmorProperty')
                                        commit('app/reduceComputedCount', {}, { root: true })
                                    })
                                }
                            })
                        })
                    })
                })
            })
            commit('app/setComputedCount', state.computedQueue.queue.length, { root: true })
            await state.computedQueue.startJob()
            dispatch('setComputedResult', rankList)
        },
        syncQueueComputed({ state, getters, commit, dispatch }, { arr1, arr2, arr3, arr4, arr5 }) {
            const rankList = []
            arr1.forEach(flower => {
                arr2.forEach(feather => {
                    arr3.forEach(hourglass => {
                        arr4.forEach(cup => {
                            arr5.forEach(hat => {
                                if (judgeArmorCount([flower, feather, hourglass, cup, hat])) {
                                    dispatch('setArmorProperty', [flower, feather, hourglass, cup, hat])
                                    rankTopFewList(rankList, {
                                        result: genFinalDamage(state, getters),
                                        armorList: [flower, feather, hourglass, cup, hat],
                                        proportionalDamage: state.proportionalDamage,
                                        critRate: getters._critRate_,
                                    })
                                    commit('unsetArmorProperty')
                                }
                            })
                        })
                    })
                })
            })
            commit('app/setComputedCount', 0, { root: true })
            dispatch('setComputedResult', rankList)
        },
        /**
         * @description 圣遗物相关属性计算
         */
        setArmorProperty({ rootState, commit }, armorList) {
            armorList.forEach(item => {
                if (item) { // 过滤空圣遗物
                    commit('setEquipmentProperty', item) // 设置圣遗物属性
                    commit('setEquipmentParams', item) // 统计当前套装配置
                }
            })
            commit('setCoordinatesProperty', rootState.app.COORDINATES_OBJ) // 设置圣遗物套装属性
            commit('transformProperty') // 转换类数值计算
        },
        /**
         * @description 设置最终的计算结果
         * @param {*} param0
         * @param {*} rankList
         */
        setComputedResult({ state, getters, commit, dispatch }, rankList) {
            if (rankList.length) {
                commit('setRankArmorList', rankList) // 设置排名列表
                dispatch('setArmorProperty', rankList[0].armorList) // 重新设置最高期望的圣遗物属性
            } else {
                commit('setRankArmorList', [{
                    result: genFinalDamage(state, getters),
                    armorList: [],
                    proportionalDamage: state.proportionalDamage,
                    critRate: getters._critRate_,
                }])
            }
        },
    },
}

export default home
