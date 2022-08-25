<template>
    <div class="equipment-add-wrap mobile-wrap">
        <div class="line-wrap">
            <ArmorDrawer v-model="data.value"></ArmorDrawer>
            <div class="main-line-wrap">
                <el-select  class="main-input" v-model="data.type" @change="changeRegionType"
                            placeholder="请选择部位">
                    <el-option  v-for="item in REGION"
                                :key="item.name"
                                :label="item.label"
                                :value="item.value">
                    </el-option>
                </el-select>
                <el-select  class="main-input" v-model="data.mainAttr" @change="changeMainAttr"
                            placeholder="请选择主属性">
                    <el-option  v-for="item in mainAttrArr"
                                :key="item.label"
                                :label="item.label"
                                :value="item">
                    </el-option>
                </el-select>
            </div>
        </div>
        <div class="split-line"></div>
        <div class="line-wrap" v-for="(secondaryAttrItem, index) in data.secondaryAttr" :key="index">
            <span>词条{{index + 1}}：</span>
            <el-select  class="secondary-input"
                        v-model="secondaryAttrItem.key"
                        @change="changeSecondaryAttr($event, index)"
                        clearable
                        placeholder="请选择属性">
                <el-option  v-for="item in secondaryAttrArr"
                            :key="item.label"
                            :label="item.label"
                            :value="item.value">
                </el-option>
            </el-select>
            <el-input-number class="add-number-input number-input"
                            v-model="secondaryAttrItem.value"
                            :controls="false"
                            :min="0"
                            :precision="secondaryAttrItem.type === 'percent' ? 1 : 0">
            </el-input-number>
            <GcRadio label="percent" unCheckLabel="number"
                    v-model="secondaryAttrItem.type"
                    v-show="secondaryAttrItem.show"
                    :disabled="secondaryAttrItem.disabled"
                    :class="secondaryAttrItem.type !== 'percent' ? 'transparent-text' : ''">%
            </GcRadio>
        </div>
        <gc-button icon="add" :width="80" :loading="submitStatus" @on-click="clickAddHandle">录入</gc-button>
        <div class="tips-msg" v-if="tipsMsg">{{tipsMsg}}</div>
        <div class="split-line"></div>
        <ImageRecognize @on-recognize="recognizeHandle"></ImageRecognize>
    </div>
</template>

<script>
import { reactive, computed, ref } from 'vue'
import { useStore } from 'vuex'
import { ElMessage, ElNotification, ElMessageBox } from 'element-plus'
import { deepClone } from '@/libs/util'
import { REGION, SECONDARY_ATTR_ARR, MAIN_ATTR_MAP, SECONDARY_ATTR_INIT } from '@/config/constant'
import { redundantArmorTest } from '@/libs/data-processing'
import ArmorDrawer from '@/single-page/components/armor-drawer.vue'
import ImageRecognize from './components/image-recognize.vue'
import GcRadio from '@/components/gc-radio.vue'

export default {
    name: 'add-equipment',
    components: {
        ArmorDrawer,
        ImageRecognize,
        GcRadio,
    },
    setup() {
        const data = reactive({
            value: '', // 圣遗物名称
            type: '', // 圣遗物类型
            mainAttr: {}, // 主属性
            secondaryAttr: deepClone(SECONDARY_ATTR_INIT), // 副词条
        })
        const submitStatus = ref(false)

        const store = new useStore()
        const addEquipmentAction = (params) => store.dispatch('equipment/addEquipmentAction', params)
        const isLogin = computed(() => store.getters['app/isLogin'])
        const COORDINATES_OBJ = computed(() => store.state.app.COORDINATES_OBJ)

        const mainAttrArr = computed(() => {
            return MAIN_ATTR_MAP[data.type] || []
        })

        const secondaryAttrArr = computed(() => {
            return SECONDARY_ATTR_ARR.filter(item => {
                if (['critRate', 'proportionalDamage', 'energyRate'].includes(data.mainAttr.value)) {
                    return item.value !== data.mainAttr.value
                }
                return true
            })
        })

        const tipsMsg = computed(() => {
            const selectedArmor = COORDINATES_OBJ.value[data.value] || {}
            return selectedArmor.msg || ''
        })

        const changeRegionType = () => { // 选择部位
            // 花/羽毛，固定主属性
            if (['flower', 'feather'].includes(data.type)) {
                data.mainAttr = MAIN_ATTR_MAP[data.type][0]
            } else {
                data.mainAttr = {}
            }
            data.secondaryAttr.forEach((item, index) => {
                changeSecondaryAttr(item.key, index)
            })
        }

        const changeMainAttr = () => { // 选择主属性类型
            data.secondaryAttr.forEach((item, index) => {
                changeSecondaryAttr(item.key, index)
            })
        }

        const changeSecondaryAttr = (value, index) => { // 选择副属性类型
            if (['critRate', 'proportionalDamage', 'energyRate'].includes(value)) { // 爆爆充，固定为百分比类型
                data.secondaryAttr[index].type = 'percent'
                data.secondaryAttr[index].disabled = true
                data.secondaryAttr[index].show = true
            } else if (value === 'proficiency') { // 精通，固定为数值类型
                data.secondaryAttr[index].type = 'number'
                data.secondaryAttr[index].disabled = false
                data.secondaryAttr[index].show = false
            } else if (data.mainAttr.value === value && data.mainAttr.type === 'percent') { // 副属性类型与主属性相同，主属性是百分比类型
                // 副属性固定为数值类型
                data.secondaryAttr[index].type = 'number'
                data.secondaryAttr[index].disabled = false
                data.secondaryAttr[index].show = false
            } else if (data.mainAttr.value === value && data.mainAttr.type === 'number') { // 副属性类型与主属性相同，主属性是数值类型
                // 副属性固定为百分比类型
                data.secondaryAttr[index].type = 'percent'
                data.secondaryAttr[index].disabled = true
                data.secondaryAttr[index].show = true
            } else {
                data.secondaryAttr[index].disabled = false
                data.secondaryAttr[index].show = true
            }
        }

        const clickAddHandle = () => {
            if (isLogin.value) {
                const { value, type, mainAttr, secondaryAttr } = data
                const { value: mainAttrKey, data: mainAttrValue, type: mainAttrType } = mainAttr

                if (!value || !type || !mainAttrKey || !mainAttrValue) {
                    ElMessage.error('请至少选择圣遗物、部位和主属性')
                    return
                }

                const formatData = {
                    name: COORDINATES_OBJ.value[value].name,
                    value,
                    type,
                    mainAttr: {
                        type: mainAttrType,
                        value: mainAttrValue,
                        key: mainAttrKey,
                    },
                    secondaryAttr,
                }
                if (redundantArmorTest(formatData)) {
                    ElMessageBox.confirm('存在相同的圣遗物，是否继续添加？', '提示', {
                        confirmButtonText: '添加',
                        cancelButtonText: '取消',
                        customStyle: { width: 'auto' },
                        type: 'warning',
                    }).then(() => {
                        addEquipment(formatData)
                    }).catch(() => {})
                } else {
                    addEquipment(formatData)
                }
            } else {
                ElMessage.error('请先登录')
            }
        }

        const addEquipment = async (params) => {
            submitStatus.value = true
            const result = await addEquipmentAction(params)
            submitStatus.value = false
            if (result) {
                data.type = ''
                data.value = ''
                data.mainAttr = {}
                data.secondaryAttr = deepClone(SECONDARY_ATTR_INIT)
            }
        }

        const recognizeHandle = (params) => {
            // 输入框清空
            data.mainAttr = {}
            data.secondaryAttr = deepClone(SECONDARY_ATTR_INIT)

            data.type = params.armorType // 圣遗物部位
            data.value = params.armorValue // 圣遗物套装的标识
            changeRegionType() // 设置默认的主属性
            if (params.mainAttr.value) data.mainAttr = params.mainAttr // 设置识别成功的主属性

            verifyRecognizeRes(params) // 校验提示

            data.secondaryAttr.forEach((item, index) => {
                if (params.secondaryAttr[index]) {
                    Object.assign(item, params.secondaryAttr[index])
                    changeSecondaryAttr(item.key, index)
                }
            })
        }

        const verifyRecognizeRes = (params) => {
            if (!params.armorType) asyncNotify('未识别到圣遗物部位')
            if (!params.armorValue) asyncNotify('未识别到套装名称')
            if (!data.mainAttr.value) asyncNotify('未识别到圣遗物主属性')
        }

        const asyncNotify = (msg) => {
            requestAnimationFrame(() => {
                ElNotification({
                    title: '识别失败',
                    message: msg,
                    type: 'error',
                    duration: 8000,
                })
            })
        }

        return {
            data, // 装备类型/副属性
            isLogin,
            tipsMsg,
            submitStatus,

            // 选项列表
            REGION,
            mainAttrArr,
            secondaryAttrArr,

            clickAddHandle,
            changeMainAttr,
            changeRegionType,
            changeSecondaryAttr,
            recognizeHandle,
        }
    },
}
</script>

<style scoped>
.equipment-add-wrap {
    background: #fff;
    padding: 0 20px;
    position: relative;
    border-top: 8px solid #fff;
    height: 100%;
    box-sizing: border-box;
    overflow-y: auto;
}
.main-line-wrap {
    width: 173px;
}
.main-input {
    width: 150px;
}
.main-input {
    margin-top: 12px;
}
.line-wrap {
    display: flex;
    align-items: flex-start;
    margin: 12px 0;
}
.line-wrap span {
    display: block;
    width: 60px;
    line-height: 28px;
}
.split-line {
    width: 100%;
    height: 1px;
    background: #e5e9ef;
    margin: 16px 0;
}
.secondary-input {
    width: 150px;
}
.add-number-input {
    width: 45px;
}
.tips-msg {
    margin-top: 16px;
    color: #e73d3d;
}
</style>

<style>
.main-input .el-input {
    font-size: 12px!important;
}
.main-input .el-input__inner {
    height: 28px;
    line-height: 28px;
}

.secondary-input .el-input {
    font-size: 12px!important;
}
.secondary-input .el-input__inner {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    height: 28px;
    line-height: 28px;
}

.add-number-input .el-input {
    height: 28px;
    line-height: 28px;
    font-size: 12px!important;
}
.add-number-input.is-without-controls .el-input__inner {
    border-radius: 0;
    box-shadow: none;
    border: 1px solid #dcdfe6;
    border-left-color: transparent;
    height: 28px;
    line-height: 28px;
}
.add-number-input .el-input__inner:focus {
    border-color: #409eff;
}

.transparent-text .gc-radio-inner {
    color: transparent;
}
</style>
