<template>
    <div class="list-wrap">
        <div class="modules-wrap">
            <div class="modules-title">· 工具一</div>
            <div class="search-input-wrap">
                <el-input v-model="inputText" 
                    @keydown.enter="searchHandle" 
                    @clear="searchHandle"
                    clearable
                    placeholder="请输入..."
                    class="search-input" />
                <el-button size="small" type="primary" style="height: 28px;border-radius: 0 3px 3px 0;" @click="searchHandle">MD5加密</el-button>
            </div>
            <el-input class="ios-textarea" type="textarea" resize="none" v-model="md5Result" />
        </div>
        <div class="modules-wrap">
            <div class="modules-title">· 工具二</div>
            <el-switch  v-model="showNumber"
                        active-color="#690"
                        inactive-color="#905"
                        active-text="数值"
                        inactive-text="公式"
                        class="result-btn" />
            <span class="tips-text" v-if="isInPc">(按回车快速切换)</span>
            <el-radio-group v-model="currentGoodsType" style="display: block;margin-bottom: 4px;">
                <el-radio :label="item" v-for="item in futuresList" :key="item" style="height: 26px;">{{item}}</el-radio>
            </el-radio-group>
            <el-radio-group v-model="currentCommissionType" style="display: block;margin-bottom: 8px;">
                <el-radio :label="item.type" v-for="item in commissionList" :key="item.type" style="height: 26px;">{{numMap[item.type] + '倍基础手续费'}}</el-radio>
            </el-radio-group>
            <template v-if="currentGoodsConfig.openCommissionType === 'percent'">
                <div v-show="showNumber">
                    <div class="line-wrap">
                        <el-input-number @click="clickInput" type="number" v-model="lot" size="small" style="width: 100px;margin-right: 3px;" />
                        <span class="operator">x</span>
                        <span class="name-span" :class="spanNumberClass">{{currentGoodsConfig.num}}</span>
                        <span class="operator">x</span>
                    </div>
                    <div class="line-wrap">
                        <span class="punctuation line-punctuation">[</span>
                    </div>
                    <div class="line-wrap" style="padding-left: 12px;" v-if="saleOrBuy">
                        <span class="operator minus-operator">-</span>
                        <div style="display: inline-flex;">
                            <span class="number-tips">开仓价</span>
                            <el-input-number @click="clickInput" class="number-tips-input" type="number" v-model="pricePrev" size="small" style="width: 100px;margin-right: 3px;" />
                        </div>
                        <span class="operator">x</span>
                        <span class="punctuation">(</span>
                        <span class="name-span" :class="spanNumberClass">1</span>
                        <span class="operator">+</span> 
                        <span class="name-span" :class="spanNumberClass">{{openCommission}}</span>
                        <span class="punctuation">)</span>
                    </div>
                    <div class="line-wrap" style="padding-left: 12px;">
                        <span class="operator" v-if="saleOrBuy">+</span>
                        <div style="display: inline-flex;">
                            <span class="number-tips" v-if="saleOrBuy">平仓价</span>
                            <span class="number-tips" v-else>开仓价</span>
                            <el-input-number @click="clickInput" v-if="saleOrBuy" class="number-tips-input" type="number" v-model="priceNext" size="small" style="width: 100px;margin-right: 3px;" />
                            <el-input-number @click="clickInput" v-else type="number" class="number-tips-input" v-model="pricePrev" size="small" style="width: 100px;margin-right: 3px;" />
                        </div>
                        <span class="operator">x</span>
                        <span class="punctuation">(</span>
                        <span class="name-span" :class="spanNumberClass">1</span>
                        <span class="operator minus-operator">-</span>
                        <span class="name-span" :class="spanNumberClass" v-if="saleOrBuy">{{closeCommission}}</span>
                        <span class="name-span" :class="spanNumberClass" v-else>{{openCommission}}</span>
                        <span class="punctuation">)</span>
                        <span class="operator" v-if="!saleOrBuy">-</span>
                    </div>
                    <div class="line-wrap" style="padding-left: 12px;" v-if="!saleOrBuy">
                        <div style="display: inline-flex;">
                            <span class="number-tips">平仓价</span>
                            <el-input-number @click="clickInput" class="number-tips-input" type="number" v-model="priceNext" size="small" style="width: 100px;margin-right: 3px;" />
                        </div>
                        <span class="operator">x</span>
                        <span class="punctuation">(</span>
                        <span class="name-span" :class="spanNumberClass">1</span>
                        <span class="operator">+</span> 
                        <span class="name-span" :class="spanNumberClass">{{closeCommission}}</span>
                        <span class="punctuation">)</span>
                    </div>
                    <div class="line-wrap">
                        <span class="punctuation">]</span>
                    </div>
                    <div class="line-wrap">
                        <span class="operator">=</span>
                        <span class="name-span" :class="spanNumberClass">{{goodsResult}}</span>
                    </div>
                    <el-checkbox class="checkbox-tool" v-model="isToday" label="日内平今仓" v-if="showToday" />
                </div>
                <div v-show="!showNumber">
                    <div class="line-wrap">
                        <span class="name-span" :class="spanNumberClass">手数</span>
                        <span class="operator">x</span>
                        <span class="name-span" :class="spanNumberClass">交易单位</span>
                        <span class="operator">x</span>
                    </div>
                    <div class="line-wrap">
                        <span class="punctuation line-punctuation">[</span>
                    </div>
                    <div class="line-wrap" style="padding-left: 12px;" v-if="saleOrBuy">
                        <span class="operator minus-operator">-</span>
                        <span class="name-span" v-if="saleOrBuy" :class="spanNumberClass">开仓价</span>
                        <span class="name-span" v-else :class="spanNumberClass">平仓价</span>
                        <span class="operator">x</span>
                        <span class="punctuation">(</span>
                        <span class="name-span" :class="spanNumberClass">1</span>
                        <span class="operator">+</span> 
                        <span class="name-span" :class="spanNumberClass" v-if="saleOrBuy">开仓手续费</span>
                        <span class="name-span" :class="spanNumberClass" v-else>平仓手续费</span>
                        <span class="punctuation">)</span>
                    </div>
                    <div class="line-wrap" style="padding-left: 12px;">
                        <span class="operator" v-if="saleOrBuy">+</span>
                        <span class="name-span" v-if="saleOrBuy" :class="spanNumberClass">平仓价</span>
                        <span class="name-span" v-else :class="spanNumberClass">开仓价</span>
                        <span class="operator">x</span>
                        <span class="punctuation">(</span>
                        <span class="name-span" :class="spanNumberClass">1</span>
                        <span class="operator minus-operator">-</span>
                        <span class="name-span" :class="spanNumberClass" v-if="saleOrBuy">平仓手续费</span>
                        <span class="name-span" :class="spanNumberClass" v-else>开仓手续费</span>
                        <span class="punctuation">)</span>
                        <span class="operator" v-if="!saleOrBuy">-</span>
                    </div>
                    <div class="line-wrap" style="padding-left: 12px;" v-if="!saleOrBuy">
                        <span class="name-span" v-if="saleOrBuy" :class="spanNumberClass">开仓价</span>
                        <span class="name-span" v-else :class="spanNumberClass">平仓价</span>
                        <span class="operator">x</span>
                        <span class="punctuation">(</span>
                        <span class="name-span" :class="spanNumberClass">1</span>
                        <span class="operator">+</span> 
                        <span class="name-span" :class="spanNumberClass" v-if="saleOrBuy">开仓手续费</span>
                        <span class="name-span" :class="spanNumberClass" v-else>平仓手续费</span>
                        <span class="punctuation">)</span>
                    </div>
                    <div class="line-wrap">
                        <span class="punctuation">]</span>
                    </div>
                    <div class="line-wrap">
                        <span class="operator">=</span>
                        <span class="name-span" :class="spanNumberClass">收益</span>
                    </div>
                    <el-checkbox class="checkbox-tool" v-model="isToday" label="日内平今仓" v-if="showToday" />
                </div>
            </template>
            <template v-else>
                <div v-show="showNumber">
                    <div class="line-wrap">
                        <el-input-number @click="clickInput" type="number" v-model="lot" size="small" style="width: 100px;margin-right: 3px;" />
                        <span class="operator">x</span>
                    </div>
                    <div class="line-wrap">
                        <span class="punctuation line-punctuation">(</span>
                    </div>
                    <div class="line-wrap" style="padding-left: 12px;">
                        <span class="name-span" :class="spanNumberClass">{{currentGoodsConfig.num}}</span>
                        <span class="operator">*</span>
                        <div style="display: inline-flex;">
                            <span class="number-tips" v-if="saleOrBuy">平仓价</span>
                            <span class="number-tips" v-else>开仓价</span>
                            <el-input-number @click="clickInput" v-if="saleOrBuy" class="number-tips-input" type="number" v-model="priceNext" size="small" style="width: 100px;margin-right: 3px;" />
                            <el-input-number @click="clickInput" v-else type="number" class="number-tips-input" v-model="pricePrev" size="small" style="width: 100px;margin-right: 3px;" />
                        </div>
                        <span class="operator">-</span>
                    </div>
                    <div class="line-wrap" style="padding-left: 12px;">
                        <span class="name-span" :class="spanNumberClass">{{currentGoodsConfig.num}}</span>
                        <span class="operator">*</span>
                        <div style="display: inline-flex;">
                            <span class="number-tips" v-if="saleOrBuy">开仓价</span>
                            <span class="number-tips" v-else>平仓价</span>
                            <el-input-number @click="clickInput" v-if="saleOrBuy" type="number" class="number-tips-input" v-model="pricePrev" size="small" style="width: 100px;margin-right: 3px;" />
                            <el-input-number @click="clickInput" v-else class="number-tips-input" type="number" v-model="priceNext" size="small" style="width: 100px;margin-right: 3px;" />
                        </div>
                        <span class="operator">-</span>
                        <span class="name-span" :class="spanNumberClass">{{openCommission + closeCommission}}</span>
                    </div>
                    <div class="line-wrap">
                        <span class="punctuation">)</span> 
                    </div>
                    <div class="line-wrap">
                        <span class="operator">=</span>
                        <span class="name-span" :class="spanNumberClass">{{goodsResult}}</span>
                    </div>
                    <el-checkbox class="checkbox-tool" v-model="isToday" label="日内平今仓" v-if="showToday" />
                </div>
                <div v-show="!showNumber">
                    <div class="line-wrap">
                        <span class="name-span" :class="spanNumberClass">手数</span>
                        <span class="operator">x</span>
                    </div>
                    <div class="line-wrap">
                        <span class="punctuation line-punctuation">(</span>
                    </div>
                    <div class="line-wrap" style="padding-left: 12px;">
                        <span class="name-span" :class="spanNumberClass">交易单位</span>
                        <span class="operator">*</span>
                        <span class="name-span" :class="spanNumberClass">卖出价</span>
                        <span class="operator">-</span>
                    </div>
                    <div class="line-wrap" style="padding-left: 12px;">
                        <span class="name-span" :class="spanNumberClass">交易单位</span>
                        <span class="operator">*</span>
                        <span class="name-span" :class="spanNumberClass">买入价</span>
                        <span class="operator">-</span>
                        <span class="name-span" :class="spanNumberClass">手续费</span>
                    </div>
                    <div class="line-wrap">
                        <span class="punctuation">)</span> 
                    </div>
                    <div class="line-wrap">
                        <span class="operator">=</span>
                        <span class="name-span" :class="spanNumberClass">收益</span>
                    </div>
                </div>
            </template>
            <el-radio-group v-model="saleOrBuy" style="display: block;margin-top: 6px;">
                <el-radio :label="1" style="height: 26px;">平多</el-radio>
                <el-radio :label="0" style="height: 26px;">平空</el-radio>
            </el-radio-group>
            <!-- <el-table border :data="tableData" style="margin-top: 12px;">
                <el-table-column :prop="String(index)" :label="`占比(${column.label})`" :key="index" v-for="(column, index) in columns" />
            </el-table> -->
        </div>
    </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import config, { PC } from '@/config'
import md5 from '@/libs/md5'
import { numMap } from '../order/index.js'

export default {
    name: 'home',
    setup() {
        const store = new useStore()

        const showNumber = ref(true)
        const inputText = ref('')
        const md5Result = ref('')
        const isToday = ref(false)
        const saleOrBuy = ref(1)
        const columns = [
            {
                percent: 4 / 26,
                label: '2 / 13',
            },
            {
                percent: 11 / 26,
                label: '11 / 26',
            },
            {
                percent: 11 / 26,
                label: '11 / 26',
            },
        ]
        
        const setGoodsLot = (value) => store.commit('app/setGoodsLot', value)
        const setGoodsPricePrev = (value) => store.commit('app/setGoodsPricePrev', value)
        const setGoodsPriceNext = (value) => store.commit('app/setGoodsPriceNext', value)
        const setGoodsType = (value) => store.commit('app/setGoodsType', value)
        const setCommissionType = (value) => store.commit('app/setCommissionType', value)
        const getFutureConfigInfo = () => store.dispatch('app/getFutureConfigInfo')

        const isInPc = computed(() => config.device === PC)
        const spanNumberClass = computed(() => showNumber.value ? 'result-number' : '')
        const goods = computed(() => store.state.app.goods)
        const futureConfigInfo = computed(() => store.state.app.futureConfigInfo)
        const futuresList = computed(() => store.getters['app/futuresList'])

        const commissionList = computed(() => {
            const filterRes = futureConfigInfo.value.filter(item => item.name === currentGoodsType.value)
            filterRes.sort((a, b) => a.type - b.type)
            return filterRes
        })

        const lot = computed({
            get() {
                return goods.value.lot
            },
            set(value) {
                setGoodsLot(value)
            },
        })

        const pricePrev = computed({
            get() {
                return goods.value.pricePrev
            },
            set(value) {
                setGoodsPricePrev(value)
            },
        })

        const priceNext = computed({
            get() {
                return goods.value.priceNext
            },
            set(value) {
                setGoodsPriceNext(value)
            },
        })

        const currentGoodsType = computed({
            get() {
                return goods.value.type
            },
            set(value) {
                setGoodsType(value)
            },
        })

        const currentCommissionType = computed({
            get() {
                return goods.value.commissionType
            },
            set(value) {
                setCommissionType(value)
            },
        })

        const tableData = computed(() => {
            const obj = {}
            columns.forEach((item, index) => {
                obj[index] = (goodsResult.value * item.percent).toFixed(2)
            })
            return [obj]
        })

        const currentGoodsConfig = computed(() => {
            let obj = {}
            commissionList.value.forEach(item => {
                if (currentCommissionType.value === item.type) {
                    obj = item
                }
            })
            return obj
        })
        
        const goodsResult = computed(() => {
            const { openCommissionType, closeCommissionType, num } = currentGoodsConfig.value

            let totalOpenCommission = 0
            let totalCloseCommission = 0

            // 计算开仓总手续费
            if (openCommissionType === 'number') {
                totalOpenCommission += openCommission.value * goods.value.lot
            } else {
                totalOpenCommission += openCommission.value * goods.value.pricePrev * num * goods.value.lot
            }

            // 计算平仓总手续费
            if (closeCommissionType === 'number') {
                totalCloseCommission += closeCommission.value * goods.value.lot
            } else {
                totalCloseCommission += closeCommission.value * goods.value.priceNext * num * goods.value.lot
            }

            let deltaPrice = 0
            if (saleOrBuy.value) { // 平多
                // 平仓价 - 开仓价
                deltaPrice = goods.value.priceNext - goods.value.pricePrev
            } else {
                deltaPrice = goods.value.pricePrev - goods.value.priceNext
            }

            return goods.value.lot * num * deltaPrice - totalOpenCommission - totalCloseCommission
        })

        const showToday = computed(() => {
            const { closeCommission, dayCloseCommission } = currentGoodsConfig.value

            return closeCommission !== dayCloseCommission
        })

        const openCommission = computed(() => {
            const { dayOpenCommission } = currentGoodsConfig.value
            let { openCommission: commission } = currentGoodsConfig.value

            if (isToday.value) {
                commission = dayOpenCommission
            }

            return commission
        })

        const closeCommission = computed(() => {
            const { dayCloseCommission } = currentGoodsConfig.value
            let { closeCommission: commission } = currentGoodsConfig.value

            if (isToday.value) {
                commission = dayCloseCommission
            }

            return commission
        })

        onMounted(async () => {
            if (isInPc.value) {
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        showNumber.value = !showNumber.value
                    }
                })
            }

            try {
                // 禁用双击缩放
                document.addEventListener("touchstart", function(event) {
                    if (event.touches.length > 1) {
                        event.preventDefault()
                    }
                })
            } catch (error) {}

            await getFutureConfigInfo()
            if (futureConfigInfo.value.length) {
                setGoodsType(futureConfigInfo.value[0].name)
                setCommissionType(futureConfigInfo.value[0].type)
            }
        })

        const searchHandle = () => {
            md5Result.value = md5(inputText.value)
        }

        const clickInput = (e) => {
            e.preventDefault()
        }

        return {
            numMap,
            lot,
            saleOrBuy,
            pricePrev,
            priceNext,
            md5Result,
            inputText,
            currentGoodsType,
            currentGoodsConfig,
            showToday,
            openCommission,
            closeCommission,
            isToday,
            goodsResult,
            showNumber,
            isInPc,
            spanNumberClass,
            columns,
            tableData,
            futuresList,
            commissionList,
            currentCommissionType,
            searchHandle,
            clickInput,
        }
    },
}
</script>

<style scoped>
.list-wrap {
    padding: 12px 12px 8px 12px;
}
.search-input-wrap {
    display: flex;
    width: 195px;
    height: 32px;
    line-height: 28px;
    right: 16px;
    top: 16px;
}
.modules-title {
    line-height: 16px;
    font-size: 14px;
    font-weight: 700;
    text-rendering: optimizelegibility;
    color: #404040;
    margin-bottom: 4px;
}
.modules-wrap {
    margin-bottom: 36px;
}
.line-wrap {
    height: 27px;
    line-height: 16px;
}
.line-wrap {
    height: 27px;
    line-height: 16px;
}
.tips-text {
    font-size: 12px;
    color: #bbb;
    margin-left: 8px;
}
.result-btn {
    height: 26px;
}
.name-span {
    display: inline-block;
    height: 23px;
    line-height: 1.92;
    padding: 0 6px;
    box-sizing: border-box;
    border: 1px solid #d9d9d9;
    color: #905;
    text-align: center;
    font-size: 12px;
    border-radius: 3px;
    margin: 2px;
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
.minus-operator {
    padding: 0 2px;
}
.punctuation {
    color: #999;
    margin: 0 2px;
    margin-bottom: 1px;
}
.number {
    color: #905;
    margin: 0 2px;
}
.result-number {
    color: #690;
}
.number-tips {
    border-radius: 4px 0 0 4px;
    background: #f5f7fa;
    border: 1px solid #dcdfe6;
    border-right: none;
    line-height: 22px;
    display: inline-block;
    padding: 0 6px;
    color: #606266;
    font-size: 12px;
}
.line-punctuation {
    line-height: 27px;
}
</style>

<style>
.search-input-wrap .el-input__inner {
    height: 28px;
    border-radius: 4px 0 0 4px;
}
.search-input-wrap .el-input__suffix {
    height: 28px;
}
.checkbox-tool {
    height: 14px;
    margin-top: 12px;
}
.number-tips-input .el-input-number__decrease {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
}
.number-tips-input .el-input__inner {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
}
</style>
