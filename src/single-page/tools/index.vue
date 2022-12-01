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
            <el-input class="tool-textarea" type="textarea" resize="none" v-model="md5Result" />
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
            <el-radio-group v-model="currentGoodsType" @change="changeType" style="display: block;margin-bottom: 4px;">
                <el-radio :label="key" v-for="(item, key) in goodsConfig" :key="key" style="height: 26px;">{{key}}</el-radio>
            </el-radio-group>
            <template v-if="currentGoodsConfig.commissionType === 'percent' || currentGoodsConfig.commissionType === 'array-percent'">
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
                        <span class="name-span" :class="spanNumberClass">{{currentCommission[0]}}</span>
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
                        <span class="name-span" :class="spanNumberClass" v-if="saleOrBuy">{{currentCommission[1]}}</span>
                        <span class="name-span" :class="spanNumberClass" v-else>{{currentCommission[0]}}</span>
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
                        <span class="name-span" :class="spanNumberClass">{{currentCommission[1]}}</span>
                        <span class="punctuation">)</span>
                    </div>
                    <div class="line-wrap">
                        <span class="punctuation">]</span>
                    </div>
                    <div class="line-wrap">
                        <span class="operator">=</span>
                        <span class="name-span" :class="spanNumberClass">{{goodsResult}}</span>
                    </div>
                    <el-radio-group v-model="saleOrBuy" style="display: block;margin-top: 6px;">
                        <el-radio :label="1" style="height: 26px;">多</el-radio>
                        <el-radio :label="0" style="height: 26px;">空</el-radio>
                    </el-radio-group>
                    <el-checkbox class="checkbox-tool" v-model="isToday" label="日内平今仓" v-if="isArrayCommission" />
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
                    <el-radio-group v-model="saleOrBuy" style="display: block;">
                        <el-radio :label="1" style="height: 26px;">多</el-radio>
                        <el-radio :label="0" style="height: 26px;">空</el-radio>
                    </el-radio-group>
                    <el-checkbox class="checkbox-tool" v-model="isToday" label="日内平今仓" v-if="isArrayCommission" />
                </div>
            </template>
            <template v-else>
                <div v-show="showNumber">
                    <div class="line-wrap">
                        <el-input-number @click="clickInput" type="number" v-model="lot" size="small" style="width: 100px;margin-right: 3px;" />
                        <span class="operator">x</span>
                    </div>
                    <div class="line-wrap">
                        <span class="punctuation line-punctuation">[</span>
                        <span class="name-span" :class="spanNumberClass">{{currentGoodsConfig.num}}</span>
                        <span class="operator">*</span>
                        <span class="punctuation">(</span>
                        <el-input-number @click="clickInput" type="number" v-model="pricePrev" size="small" style="width: 94px;margin: 0 3px;" />
                        <span class="operator">-</span> 
                        <el-input-number @click="clickInput" type="number" v-model="priceNext" size="small" style="width: 94px;margin: 0 3px;" />
                        <span class="punctuation">)</span>
                        <span class="operator">-</span>
                        <span class="name-span" :class="spanNumberClass">{{currentCommission}}</span>
                        <span class="punctuation">]</span> 
                    </div>
                    <div class="line-wrap">
                        <span class="operator">=</span>
                        <span class="name-span" :class="spanNumberClass">{{goodsResult}}</span>
                    </div>
                    <el-checkbox class="checkbox-tool" v-model="isToday" label="日内平今仓" v-if="isArrayCommission" />
                </div>
                <div v-show="!showNumber">
                    <div class="line-wrap">
                        <span class="name-span" :class="spanNumberClass">手数</span>
                        <span class="operator">x</span>
                    </div>
                    <div class="line-wrap">
                        <span class="punctuation line-punctuation">[</span>
                        <span class="name-span" :class="spanNumberClass">交易单位</span>
                        <span class="operator">*</span>
                        <span class="punctuation">(</span>
                        <span class="name-span" :class="spanNumberClass">卖出价</span>
                        <span class="operator">-</span>
                        <span class="name-span" :class="spanNumberClass">买入价</span>
                        <span class="punctuation">)</span>
                        <span class="operator">-</span>
                        <span class="name-span" :class="spanNumberClass">手续费</span>
                        <span class="punctuation">]</span> 
                    </div>
                    <div class="line-wrap">
                        <span class="operator">=</span>
                        <span class="name-span" :class="spanNumberClass">收益</span>
                    </div>
                </div>
            </template>
            <el-table border :data="tableData" style="margin-top: 12px;">
                <el-table-column :prop="String(index)" :label="`占比(${column.label})`" :key="index" v-for="(column, index) in columns" />
            </el-table>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import config, { PC } from '@/config'
import md5 from '@/libs/md5'
import { goodsConfig } from '@/store/app'

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
        
        const fetchInsertLogHandle = (value) => store.dispatch('app/fetchInsertLogHandle', value)
        const setGoodsLot = (value) => store.commit('app/setGoodsLot', value)
        const setGoodsPricePrev = (value) => store.commit('app/setGoodsPricePrev', value)
        const setGoodsPriceNext = (value) => store.commit('app/setGoodsPriceNext', value)
        const setGoodsType = (value) => store.commit('app/setGoodsType', value)

        const isInPc = computed(() => config.device === PC)
        const spanNumberClass = computed(() => showNumber.value ? 'result-number' : '')
        const goods = computed(() => store.state.app.goods)

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

        const tableData = computed(() => {
            const obj = {}
            columns.forEach((item, index) => {
                obj[index] = (goodsResult.value * item.percent).toFixed(2)
            })
            return [obj]
        })

        const currentGoodsConfig = computed(() => {
            return goodsConfig[currentGoodsType.value]
        })

        const isArrayCommission = computed(() => {
            return currentGoodsConfig.value.commissionType.indexOf('array') > -1
        })
        
        const goodsResult = computed(() => {
            if (currentGoodsConfig.value.commissionType === 'number' || currentGoodsConfig.value.commissionType === 'array') {
                return goods.value.lot * 
                    (
                        currentGoodsConfig.value.num * 
                        (goods.value.pricePrev - goods.value.priceNext) - currentCommission.value
                    )
            } else {
                if (saleOrBuy.value) { // 多
                    return (goods.value.lot * currentGoodsConfig.value.num *
                        (
                            goods.value.priceNext - // 平仓价
                            goods.value.pricePrev - // 开仓价 
                            goods.value.priceNext * currentCommission.value[1] - // 平仓价手续费
                            goods.value.pricePrev * currentCommission.value[0] // 开仓价手续费
                        )).toFixed(1)
                } else { // 空
                    return (goods.value.lot * currentGoodsConfig.value.num *
                        (
                            goods.value.pricePrev - // 开仓价 
                            goods.value.priceNext - // 平仓价
                            goods.value.priceNext * currentCommission.value[1] - // 平仓价手续费
                            goods.value.pricePrev * currentCommission.value[0] // 开仓价手续费
                        )).toFixed(1)
                }
                
            }
        })

        const currentCommission = computed(() => {
            if (currentGoodsConfig.value.commissionType === 'number' || currentGoodsConfig.value.commissionType === 'percent') {
                return currentGoodsConfig.value.commission
            } else {
                if (isToday.value) {
                    return currentGoodsConfig.value.commission[1]
                } else {
                    return currentGoodsConfig.value.commission[0]
                }
            }
        })

        onMounted(() => {
            fetchInsertLogHandle()
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
        })

        const searchHandle = () => {
            md5Result.value = md5(inputText.value)
        }

        const clickInput = (e) => {
            e.preventDefault()
        }

        const changeType = () => {
            setGoodsPricePrev(currentGoodsConfig.value.defaultPrice)
            setGoodsPriceNext(currentGoodsConfig.value.defaultPrice)
        }

        return {
            lot,
            saleOrBuy,
            pricePrev,
            priceNext,
            md5Result,
            inputText,
            goodsConfig,
            currentGoodsType,
            currentGoodsConfig,
            currentCommission,
            isArrayCommission,
            isToday,
            goodsResult,
            showNumber,
            isInPc,
            spanNumberClass,
            columns,
            tableData,
            searchHandle,
            changeType,
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
.tool-textarea > textarea{
    border: 1px solid #dcdfe6;
    box-shadow: none;
    transition: border .2s cubic-bezier(0.645, 0.045, 0.355, 1);
    padding-left: 8px;
    padding-right: 8px;
    font-size: 14px;
}
.tool-textarea > .el-textarea__inner:hover {
    box-shadow: none;
    border: 1px solid #c0c4cc;
}
.tool-textarea > .el-textarea__inner:focus {
    box-shadow: none;
    border: 1px solid #409eff;
}
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
