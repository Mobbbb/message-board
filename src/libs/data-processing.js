import store from '@/store'

const HAD = ['HP', 'ATK', 'DEF']

export const filterDataByText = (text, data, key = 'ubbContent') => {
    let regStr = ['', ...text.trim().toLowerCase(), ''].join('.*')
    let reg = new RegExp(regStr)

    let filterData = data.filter(item => {
        let nameTestStatus = reg.test(item[key].toLowerCase()) // 输入abc，匹配abc、abcdefg...
        || text.trim().toLowerCase().indexOf(item[key].toLowerCase()) > -1 // 输入框abc，匹配abc、ab、bc、a、b、c
        
        return nameTestStatus
    })

    return filterData
}

/**
 * @description 属性加成对象合并至state
 * @param {*} params
 * @param {*} state
 * @returns
 */
export const addProperty = (params, state) => {
    const {
        weaponTypeLimited, damageTypeLimited, characterLimited,
        damageNatureLimited, skillLimited, reactionLimited,
        presetPassiveSkill,
        key, value, type,
    } = params
    const { name, selectedReaction } = state
    const { currentDamageNature, currentActiveSkills } = store.state.character
    const activePassiveSkillsNames = store.getters['character/activePassiveSkillsNames']

    if (typeof state[key] === 'undefined') return

    // 若存在武器类型限制，当前角色武器类型不满足条件，跳过此次属性加成
    if (weaponTypeLimited && !weaponTypeLimited.includes(state.weaponType)) return

    // 若存在伤害类型限制，当前伤害类型不满足条件，跳过此次属性加成
    if (damageTypeLimited && !damageTypeLimited.includes(currentActiveSkills.type)) return

    // 若存在技能名称限制，当前技能名称不满足条件，跳过此次属性加成
    if (skillLimited && !skillLimited.includes(currentActiveSkills.name)) return

    // 若存在伤害属性限制，当前伤害属性不满足条件，跳过此次属性加成
    if (damageNatureLimited && !damageNatureLimited.includes(currentDamageNature)) return

    // 若存在角色专属限制，当前角色不满足条件，跳过此次属性加成
    if (characterLimited && !characterLimited.includes(name)) return

    // 若存在反应类型限制，当前反应类型不满足条件，跳过此次属性加成
    if (reactionLimited && !reactionLimited.includes(selectedReaction.label)) return

    // 若存在前置被动技能限制，当前不满足条件，跳过此次属性加成
    if (presetPassiveSkill && !activePassiveSkillsNames.includes(presetPassiveSkill)) return

    if (type === 'percent' && HAD.includes(key)) {
        state[key] = state[key].add(Math.round(state[`base${key}`] * value / 100))
    } else {
        state[key] = state[key].add(value)
    }
}

export const resetProperty = (state) => {
    // 转换属性
    state.HPToATK = 0 // HP转ATK
    state.DEFToATK = 0 // 防御力转攻击力
    state.EnergyToE = 0
    state.EnergyToW = 0
    state.EnergyToATK = 0
    state.EnergyToDamageExtra = 0
    state.ProToDmaE = 0
    state.DEFToOriginalDamageExtra = 0
    state.ATKToOriginalDamageExtra = 0
    state.HPToOriginalDamageExtra = 0
    state.TreatmentToHPToOriginalDamageExtra = 0

    // 其他加成
    state.treatment = 0 // 治疗加成
    state.elementRate = 0 // 全属性攻击增加
    state.damageRateExtra = 0 // 伤害加成
    state.damageRateExtraA = 0 // 普攻伤害加成
    state.damageRateExtraN = 0 // 重击伤害加成
    state.damageRateExtraD = 0 // 下落伤害加成
    state.damageRateExtraE = 0 // 元素战技伤害加成
    state.damageRateExtraQ = 0 // 元素爆发伤害加成
    state.damageRateExtraAN = 0 // 普攻/重击伤害加成
    state.reactionRateExtra = 0 // 反应系数加成
    state.originalDamageExtra = 0 // 原始伤害加成
    state.reduceDefRate = 0 // 防御力减少
    state.extraMultiplyingRateA = 0 // 普攻技能倍率额外提升
    state.extraMultiplyingRateE = 0 // 元素战技技能倍率额外提升
    state.extraMultiplyingRateQ = 0 // 元素爆发技能倍率额外提升
    state.hierarchyRateQ = 0 // 元素爆发每层倍率
    state.critRateN = 0 // 重击暴击率增加
    state.critRateE = 0 // 元素战技暴击率增加
    state.critRateQ = 0 // 元素爆发暴击率增加

    // 抗性
    state.reduceResRate = 0 // 所有抗性减少
    state.reduceResRateEle = 0 // 元素抗性减少
    state.reduceResRateF = 0 // 火属性抗性减少
    state.reduceResRateW = 0 // 水属性抗性减少
    state.reduceResRateI = 0 // 冰属性抗性减少
    state.reduceResRateS = 0 // 土属性抗性减少
    state.reduceResRateA = 0 // 风属性抗性减少
    state.reduceResRateE = 0 // 雷属性抗性减少
    state.reduceResRateP = 0 // 物理属性抗性减少
    state.reduceResRatePI = 0 // 物理/冰属性抗性减少

    state.equipmentParams = {} // 套装情况

    state.rankArmorList = [] // 圣遗物排名列表
}

export const rankTopFewList = (list, params, topIndex = 5) => {
    if (!list.length) {
        list.push(params)
    } else if (list.length < topIndex) {
        let flag = false
        for (let i = 0; i < list.length; i++) {
            if (params.result > list[i].result) {
                list.splice(i, 0, params)
                flag = true
                break
            }
        }
        if (!flag) {
            list.push(params)
        }
    } else if (params.result > list[topIndex - 1].result) {
        for (let i = 0; i < list.length; i++) {
            if (params.result > list[i].result) {
                list.splice(i, 0, params)
                break
            }
        }
        list.pop()
    }
}

export const splitEquipmentList = (list) => {
    const arr1 = []; const arr2 = []; const arr3 = []; const arr4 = []; const arr5 = []

    list.forEach(item => {
        if (item.selected) {
            switch (item.type) {
                case 'flower':
                    arr1.push(item)
                    break
                case 'feather':
                    arr2.push(item)
                    break
                case 'hourglass':
                    arr3.push(item)
                    break
                case 'cup':
                    arr4.push(item)
                    break
                case 'hat':
                    arr5.push(item)
                    break
                default:
                    break
            }
        }
    })

    if (!arr1.length) arr1.push(null)
    if (!arr2.length) arr2.push(null)
    if (!arr3.length) arr3.push(null)
    if (!arr4.length) arr4.push(null)
    if (!arr5.length) arr5.push(null)

    return { arr1, arr2, arr3, arr4, arr5 }
}

export const parseCharacterData = (CHARACTERS) => {
    const EDITABLE_ARR = []
    const CHARACTERS_OBJ = {}
    CHARACTERS.forEach((item, index) => {
        item.value = index // el-select组件用
        const tempDuplicateNumSkills = []
        const tempDuplicateNumSkillsOjb = {}
        item.duplicateNumSkills.forEach(cell => {
            tempDuplicateNumSkillsOjb[cell.index] = cell
        })
        // 空命座补充
        new Array(6).fill(0).forEach((cell, cellIndex) => {
            const duplicateNumSkillsItem = tempDuplicateNumSkillsOjb[cellIndex + 1] || null
            if (duplicateNumSkillsItem) {
                tempDuplicateNumSkills.push(duplicateNumSkillsItem)
            } else {
                tempDuplicateNumSkills.push({
                    index: cellIndex + 1,
                    property: [],
                })
            }
        })
        item.duplicateNumSkills = tempDuplicateNumSkills

        const property = []
        item.passiveSkills.forEach((cell, cellIndex) => {
            cell.property.forEach((atom, propertyIndex) => {
                if (atom.editable || typeof atom.hierarchyNum !== 'undefined') property.push({
                    ...atom,
                    propertyIndex,
                    skillIndex: cellIndex,
                    skillName: cell.name,
                    skillKey: 'passiveSkills',
                })
            })
        })
        item.duplicateNumSkills.forEach((cell, cellIndex) => {
            cell.property.forEach((atom, propertyIndex) => {
                if (typeof atom.hierarchyNum !== 'undefined') property.push({
                    ...atom,
                    propertyIndex,
                    skillIndex: cellIndex,
                    skillName: `命座${cell.index}`,
                    skillKey: 'duplicateNumSkills',
                })
            })
        })
        if (property.length) EDITABLE_ARR.push({
            index,
            name: item.name,
            property,
        })

        CHARACTERS_OBJ[item.name] = item
    })

    return {
        CHARACTERS,
        CHARACTERS_OBJ,
        EDITABLE_ARR,
    }
}

export const parseWeaponData = (WEAPONS) => {
    const EDITABLE_ARR = []
    const WEAPONS_OBJ = {}
    WEAPONS.forEach((item, index) => {
        item.value = index // el-select组件用
        WEAPONS_OBJ[item.name] = item

        const property = []
        item.secondaryAttr.forEach((cell, propertyIndex) => {
            // 开关类型buff/层数类型buff
            if (typeof cell.actived !== 'undefined' || typeof cell.hierarchyNum !== 'undefined') {
                property.push({ ...cell, propertyIndex })
            }
        })
        if (property.length) EDITABLE_ARR.push({
            index,
            name: item.name,
            msg: item.msg,
            property,
        })
    })

    return {
        WEAPONS,
        WEAPONS_OBJ,
        EDITABLE_ARR,
    }
}

export const parseTeammateData = (TEAMMATE) => {
    const EDITABLE_ARR = []
    const TEAMMATE_OBJ = {}
    TEAMMATE.forEach((item, index) => {
        item.value = index // el-select组件用
        TEAMMATE_OBJ[item.name] = item

        const property = []
        item.secondaryAttr.forEach((cell, propertyIndex) => {
            // 开关类加成/编辑类加成
            if (typeof cell.actived !== 'undefined' || cell.editable) {
                property.push({ ...cell, propertyIndex })
            }
        })
        if (property.length) EDITABLE_ARR.push({
            index,
            name: item.name,
            msg: item.msg,
            property,
        })
    })

    return {
        TEAMMATE,
        TEAMMATE_OBJ,
        EDITABLE_ARR,
    }
}

export const parseCoordinateData = (COORDINATES) => {
    const EDITABLE_ARR = []
    const COORDINATES_OBJ = {}
    COORDINATES.forEach((item, index) => {
        let str = ''
        const splitName = []
        for (const index in item.name) {
            str += item.name[index]
            if (index % 2) {
                splitName.push(str)
                str = ''
            }
        }
        str = ''
        const malpositionStr = item.name.slice(1)
        for (const index in malpositionStr) {
            str += malpositionStr[index]
            if (index % 2) {
                splitName.push(str)
                str = ''
            }
        }
        item.splitName = splitName // 获取切割的套装名称，用于模糊匹配
        COORDINATES_OBJ[item.value] = item

        let property = []
        item[2].forEach((cell, propertyIndex) => {
            if (cell.editable) property.push({ ...cell, propertyIndex })
        })
        if (property.length) EDITABLE_ARR.push({
            index,
            value: item.value,
            name: `${item.name}-2件套属性`,
            coordinatedKey: 2,
            property,
        })

        property = []
        item[4].forEach((cell, propertyIndex) => {
            if (cell.editable) property.push({ ...cell, propertyIndex })
        })
        if (property.length) EDITABLE_ARR.push({
            index,
            value: item.value,
            name: `${item.name}-4件套属性`,
            coordinatedKey: 4,
            property,
        })
    })

    return {
        COORDINATES,
        COORDINATES_OBJ,
        EDITABLE_ARR,
    }
}

export const computedScore = (params, scoreCharacterInfo) => {
    const { name, nature } = scoreCharacterInfo
    let score = 0
    let scoreMap = SCORE_MAP.normal // 通用分数表
    if (SCORE_MAP[name]) scoreMap = SCORE_MAP[name]

    params.secondaryAttr.forEach(cell => {
        if (scoreMap[cell.type] && scoreMap[cell.type][cell.key]) {
            score = score.add(cell.value * scoreMap[cell.type][cell.key])
        }

        // 通用分数表，为火属性角色的精通词条统一加分
        if (!SCORE_MAP[name] && nature === 'F' && cell.key === 'proficiency') {
            score = score.add(cell.value * SCORE_MAP.special[cell.key])
        }
    })
    return score
}

/**
 * @description 判断当前套装是否符合计算要求
 * @param {*} armorList
 * @returns
 */
export const judgeArmorCount = (armorList) => {
    if (store.state.home.armorFilterConfig.double || store.state.home.armorFilterConfig.quadruple) {
        let count = 0
        const armorParams = {}
        armorList.forEach(item => { // 为当前穿戴的圣遗物套装计数
            if (item) {
                if (armorParams[item.value]) {
                    armorParams[item.value]++
                } else {
                    armorParams[item.value] = 1
                }
            }
        })
        Object.keys(armorParams).forEach(key => {
            if (store.state.home.armorFilterConfig.double) { // 2 + 2
                if (armorParams[key] > 1) {
                    count += armorParams[key]
                }
            } else if (store.state.home.armorFilterConfig.quadruple) { // 4件套
                if (armorParams[key] >= 4) {
                    count = 4
                }
            }
        })
        return count >= 4
    }
    return true
}

/**
 * @description 判断当前圣遗物是否已存在
 * @param {*} params
 * @returns {Boolean}
 */
export const redundantArmorTest = (params) => {
    let sameFalg = [false, false, false, false]
    const { value, type, mainAttr, secondaryAttr } = params
    const { equipmentList } = store.state.equipment
    for (let i = 0; i < equipmentList.length; i++) {
        if (equipmentList[i].value === value &&
            equipmentList[i].type === type &&
            equipmentList[i].mainAttr.key === mainAttr.key) {
            sameFalg = [false, false, false, false]
            for (let j = 0; j < secondaryAttr.length; j++) {
                equipmentList[i].secondaryAttr.forEach(attrItem => {
                    if (attrItem.key === secondaryAttr[j].key &&
                        attrItem.value === secondaryAttr[j].value &&
                        attrItem.type === secondaryAttr[j].type) {
                        sameFalg[j] = true
                    }
                })
                // 存在一个词条不重复，就进入下个圣遗物判断
                if (!sameFalg[j]) break
            }
            // 找到重复的圣遗物就停止
            if (sameFalg[0] && sameFalg[1] && sameFalg[2] && sameFalg[3]) break
        }
    }
    return sameFalg[0] && sameFalg[1] && sameFalg[2] && sameFalg[3]
}

export const getRecognizeWhitelist = () => {
    let whitelist = '0123456789%+.:物理雷火水冰岩风雷元素伤害治疗加成'
    SECONDARY_ATTR_ARR.forEach(item => {
        whitelist += item.label
    })
    REGION.forEach(item => {
        whitelist += item.label
    })
    store.state.app.COORDINATES.forEach(item => {
        whitelist += item.name
    })
    return whitelist
}

export const formatRecognizeRes = (recognizeRes) => {
    const resultTextArr = []
    const { text } = recognizeRes
    const splitResultText = text.split('\n')
    splitResultText.forEach(item => {
        // 过滤长度小于1的字符，并去除空格、冒号
        if (item.length > 1) resultTextArr.push(item.replace(/[ ]|:/g, ''))
    })

    let armorType = '' // 圣遗物部位
    let armorParams = { // 圣遗物套装配置信息
        value: '',
        score: 0,
    }
    let mainAttrMap = [] // 圣遗物对应部位的所有主属性列表
    console.log('[Recognized]', resultTextArr)
    resultTextArr.forEach(item => {
        const cnResultTextArr = item.match(/[\u4e00-\u9fa5]+/g) || []
        const cnResultText = cnResultTextArr[0] || ''
        // 获取圣遗物部位
        REGION.forEach(cell => {
            if (cnResultText.indexOf(cell.label) > -1) {
                armorType = PROPERTY_NAME_MAP[cell.label] || ''
                mainAttrMap = MAIN_ATTR_MAP[armorType] || []
            }
        })
        // 获取圣遗物套装名称
        const newArmorParams = getCoordinateByText(cnResultText) // 获取与单行文字最相似的套装名称
        if (newArmorParams.score > armorParams.score) { // 对比多行文字，选择最准确的套装名称
            armorParams = newArmorParams
        }
    })

    // 圣遗物主属性提取
    let mainAttr = {}
    for (let i = 0; i < resultTextArr.length; i++) {
        // 判断不含+与%的文字作为主属性
        if (resultTextArr[i].indexOf('+') === -1 && resultTextArr[i].indexOf('%') === -1) {
            const cnResultTextArr = resultTextArr[i].match(/[\u4e00-\u9fa5]+/g) || []
            const cnResultText = cnResultTextArr[0] || ''
            mainAttrMap.forEach(item => {
                if (cnResultText.indexOf(item.label) > -1 || item.label.indexOf(cnResultText) > -1) {
                    mainAttr = item
                }
            })
        }
        if (mainAttr.value) break
    }

    // 圣遗物副属性提取
    const secondaryAttr = []
    resultTextArr.forEach(item => {
        if (item.indexOf('+') > -1 && item.length > 4) {
            const propertyNameArr = item.match(/[\u4e00-\u9fa5]+/g) || []
            const propertyName = propertyNameArr[0] || ''
            secondaryAttr.push({
                key: PROPERTY_NAME_MAP[propertyName] || '',
                value: Number(item.split('+')[1].split('%')[0]) || 0,
                type: item.indexOf('%') > -1 ? 'percent' : 'number',
            })
        }
    })

    return {
        armorType,
        armorValue: armorParams.value,
        mainAttr,
        secondaryAttr,
    }
}

const getCoordinateByText = (text) => {
    const armorParams = {
        value: '',
        score: 0,
    }
    store.state.app.COORDINATES.forEach(item => {
        let similarScore = 0
        item.splitName.forEach(cell => {
            if (text.indexOf(cell) > -1) {
                similarScore++
            }
        })
        if (similarScore > armorParams.score) { // 选择相似度最高的套装名称作为识别结果
            armorParams.value = item.value
            armorParams.score = similarScore
        }
    })
    return armorParams
}

/**
 * @description 最终伤害计算
 * @param {*} param0
 * @returns
 */
export const genFinalDamage = (state, getters) => {
    const {
        proportionalDamage, // 爆伤
        originalDamageExtra, // 原始伤害增加
    } = state
    const {
        _proficiencyRate_, // 元素反应倍率
        _critRate_, // 暴击率
        _originalDamage_, // 原始伤害
        _damageRateExtra_, // 伤害增加
        _reduceResRate_, // 抗性增伤
        _defenseRate_, // 减防增伤
    } = getters

    return (_originalDamage_ + originalDamageExtra) * // 最终原始伤害
        (1 + _critRate_ / 100 * proportionalDamage / 100) * // 爆伤
        (1 + _damageRateExtra_ / 100) * // 增伤乘区，元素属性伤害增加 + 技能伤害增加...
        _proficiencyRate_ * // 元素反应倍率
        _reduceResRate_ *
        _defenseRate_
}
