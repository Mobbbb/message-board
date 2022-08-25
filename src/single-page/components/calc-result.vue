<template>
    <div class="calc-result-btn" @click="clickHandle">
        <el-icon class="tips-icon"><Cellphone /></el-icon>
        <span>计算过程</span>
    </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { Cellphone } from '@element-plus/icons-vue'

export default {
    name: 'calc-result',
    components: {
        Cellphone,
    },
    setup() {
        const store = new useStore()

        const homeState = computed(() => store.state.home)

        return {
            clickHandle: () => store.commit('app/setCalcResultStatus', true),
            homeState,
            critRate_: computed(() => store.getters['home/_critRate_']),
            finallyElementRateF: computed(() => store.getters['home/finallyElementRateF']),
            finallyElementRateW: computed(() => store.getters['home/finallyElementRateW']),
            finallyElementRateI: computed(() => store.getters['home/finallyElementRateI']),
            finallyElementRateS: computed(() => store.getters['home/finallyElementRateS']),
            finallyElementRateA: computed(() => store.getters['home/finallyElementRateA']),
            finallyElementRateE: computed(() => store.getters['home/finallyElementRateE']),
            finallyElementRateP: computed(() => store.getters['home/finallyElementRateP']),
            damageRateExtra_: computed(() => store.getters['home/_damageRateExtra_'].toFixed(1)),
        }
    },
}
</script>

<style scoped>
.calc-result-btn {
    position: absolute;
    width: 28px;
    height: 78px;
    top: 0;
    right: -40px;
    z-index: 99;
    background-color: white;
    border: 1px solid #e7e7e7;
    color: #505050;
    border-radius: 2px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 5px;
}
.calc-result-btn:hover {
    cursor: pointer;
    background: #f8f8f8;
}
.tips-icon {
    font-size: 15px;
    margin-bottom: 3px;
    color: #2e2e2e;
}
.calc-result-btn span {
    display: inline-block;
    font-size: 12px;
    line-height: 14px;
    width: 12px;
}
</style>
