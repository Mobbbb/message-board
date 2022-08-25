<template>
    <el-drawer  v-model="drawerShowStatus" direction="rtl" custom-class="calc-result-drawer"
                :size="drawerWidth" :with-header="false" :destroy-on-close="true">
        <template #default>
            <el-switch  v-model="showNumber"
                        active-color="#690"
                        inactive-color="#905"
                        active-text="数值"
                        inactive-text="公式"
                        class="result-btn" />
            <span class="tips-text" v-if="isInPc">(按回车快速切换)</span>
            <div class="line-wrap">
                <span class="punctuation">(</span>
                <el-tooltip effect="light" placement="bottom">
                    <template #content>
                        <span class="name-span" :class="spanNumberClass">{{skillRate}}</span>
                        <span class="operator">x</span>
                        <span class="name-span" :class="spanNumberClass">{{skillRateBase}}</span>
                    </template>
                    <span class="name-span hover-name-span" :class="spanNumberClass">{{originalDamage_}}</span>
                </el-tooltip>
                <span class="operator">+</span>
                <span class="name-span" :class="spanNumberClass">{{originalDamageExtra}}</span>
                <span class="punctuation">)</span>
                <span class="operator">x</span>
            </div>
            <div class="line-wrap">
                <span class="punctuation">(</span>
                <span class="number" :class="spanNumberClass">1</span>
                <span class="operator">+</span>
                <span class="name-span" :class="spanNumberClass">{{critRate_}}</span>
                <span class="operator">x</span>
                <span class="name-span" :class="spanNumberClass">{{proportionalDamage}}</span>
                <span class="punctuation">)</span>
                <span class="operator">x</span>
            </div>
            <div class="line-wrap">
                <span class="punctuation">(</span>
                <span class="number" :class="spanNumberClass">1</span>
                <span class="operator">+</span>
                <el-tooltip effect="light" placement="bottom">
                    <template #content>
                        <span class="name-span" :class="spanNumberClass">{{finallyElementRate}}</span>
                        <span class="operator">+</span>
                        <span class="name-span" :class="spanNumberClass">{{finalDamageRateExtra}}</span>
                    </template>
                    <span class="name-span" :class="spanNumberClass">{{damageRateExtra_}}</span>
                </el-tooltip>
                <span class="punctuation">)</span>
                <span class="operator">x</span>
            </div>
            <div class="line-wrap">
                <span class="name-span" :class="spanNumberClass">{{proficiencyRate_}}</span>
                <span class="operator">x</span>
            </div>
            <div class="line-wrap">
                <span class="name-span" :class="spanNumberClass">{{reduceResRate_}}</span>
                <span class="operator">x</span>
            </div>
            <div class="line-wrap">
                <span class="name-span" :class="spanNumberClass">{{defenseRate_}}</span>
            </div>
        </template>
    </el-drawer>
</template>

<script>
import { computed, ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import config, { PC } from '@/config'
import OBJ_MAP from '@/config/obj-map'

export default {
    name: 'calc-drawer',
    setup() {
        const store = new useStore()

        const showNumber = ref(false)
        const setCalcResultStatus = (value) => store.commit('app/setCalcResultStatus', value)
        const overMediaCritical = computed(() => store.getters['app/overMediaCritical'])
        const homeState = computed(() => store.state.home)
        const skillRateBaseKey = computed(() => store.state.character.currentActiveSkills.baseKey || 'ATK')
        const drawerWidth = computed(() => overMediaCritical.value ? 234 : 352)
        const spanNumberClass = computed(() => showNumber.value ? 'result-number' : '')

        const drawerShowStatus = computed({
            get() {
                return store.state.app.showCalcResultStatus
            },
            set(value) {
                setCalcResultStatus(value)
            },
        })

        const critRate_ = computed(() => {
            return showNumber.value ? `${store.getters['home/_critRate_']}%` : '暴击率'
        })

        const originalDamage_ = computed(() => {
            return showNumber.value ? Math.round(store.getters['home/_originalDamage_']) : '原始伤害'
        })

        const damageRateExtra_ = computed(() => {
            return showNumber.value ? `${store.getters['home/_damageRateExtra_'].toFixed(1)}%` : '增伤乘区'
        })

        const proficiencyRate_ = computed(() => {
            return showNumber.value
                ? `${(store.getters['home/_proficiencyRate_'] * 100).toFixed(1)}%`
                : '反应倍率'
        })

        const reduceResRate_ = computed(() => {
            return showNumber.value
                ? `${(store.getters['home/_reduceResRate_'] * 100).toFixed(1)}%`
                : '抗性增/减伤'
        })

        const defenseRate_ = computed(() => {
            return showNumber.value
                ? `${(store.getters['home/_defenseRate_'] * 100).toFixed(1)}%`
                : '防御减伤'
        })

        const proportionalDamage = computed(() => {
            return showNumber.value ? `${store.state.home.proportionalDamage}%` : '暴击伤害'
        })

        const originalDamageExtra = computed(() => {
            return showNumber.value ? `${Math.round(store.state.home.originalDamageExtra)}` : '原始伤害增加'
        })

        const skillRate = computed(() => {
            let numberText = (originalDamage_.value / homeState.value[skillRateBaseKey.value] * 100).toFixed(1)
            if (!homeState.value[skillRateBaseKey.value]) numberText = 0
            return showNumber.value ? `${numberText}%` : '技能倍率'
        })

        const skillRateBase = computed(() => {
            return showNumber.value ? homeState.value[skillRateBaseKey.value] : OBJ_MAP[skillRateBaseKey.value]
        })

        const finallyElementRate = computed(() => {
            return showNumber.value ? `${store.getters['home/finallyElementRate']}%` : '元素增伤'
        })

        const finalDamageRateExtra = computed(() => {
            return showNumber.value ? `${store.getters['home/finalDamageRateExtra']}%` : '其他增伤'
        })

        const isInPc = computed(() => config.device === PC)

        const chanageShowStatus = () => {
            showNumber.value = !showNumber.value
        }

        onMounted(() => {
            if (isInPc.value) {
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && drawerShowStatus.value) {
                        showNumber.value = !showNumber.value
                    }
                })
            }
        })

        return {
            showNumber,
            drawerShowStatus,
            drawerWidth,
            spanNumberClass,
            critRate_,
            originalDamage_,
            damageRateExtra_,
            proficiencyRate_,
            reduceResRate_,
            defenseRate_,
            proportionalDamage,
            originalDamageExtra,
            skillRate,
            skillRateBase,
            finallyElementRate,
            finalDamageRateExtra,
            isInPc,
            chanageShowStatus,
        }
    },
}
</script>

<style scoped>
.line-wrap {
    line-height: 16px;
    font-size: 14px;
}
.tips-text {
    font-size: 12px;
    color: #bbb;
    margin-left: 8px;
}
.result-btn {
    margin-bottom: 4px;
}
.name-span {
    display: inline-block;
    height: 23px;
    line-height: 1.92;
    padding: 0 8px;
    box-sizing: border-box;
    border: 1px solid #d9d9d9;
    color: #905;
    text-align: center;
    font-size: 12px;
    border-radius: 3px;
    margin: 2px 4px;
}
.hover-name-span:hover {
    cursor: pointer;
    background: #f8f8f8;
}
.operator {
    color: #9a6e3a;
    background: hsla(0, 0%, 100%, .5);
    margin: 0 2px;
}
.punctuation {
    color: #999;
    margin-bottom: 1px;
}
.number {
    color: #905;
    margin: 0 2px;
}
.result-number {
    color: #690;
}
</style>

<style>
.calc-result-drawer .el-drawer__body {
    padding: 8px;
}
</style>
