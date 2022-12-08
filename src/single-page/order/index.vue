<template>
    <div class="order-wrap">
        <el-tabs v-model="activeName" @tab-click="handleClick" class="order-tab">
            <el-tab-pane label="开 / 平仓" name="add">
                <div class="table-wrap">
                    <el-form :model="formData" label-width="95px" label-position="left"
                        ref="ruleFormRef"
                        :rules="rules"
                        style="width: 400px;padding-left: 24px;">
                        <el-form-item label="交易日期" prop="date">
                            <el-date-picker v-model="formData.date" type="datetime" placeholder="请选择日期" :editable="false" :clearable="false" />
                        </el-form-item>
                        <el-form-item label="合约" prop="name">
                            <el-select v-model="formData.name" placeholder="请选择合约" filterable @change="changeOrderName">
                                <el-option :label="item" :value="item" v-for="item in futuresConfigList" :key="item"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="手续费标准" prop="commissionId">
                            <el-select v-model="formData.commissionId" placeholder="请选择手续费" filterable>
                                <el-option :label="numMap[item.type] + '倍'" :value="item.id" v-for="item in commissionList" :key="item.id"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="成交价" prop="price">
                            <el-input-number v-model="formData.price" :controls="false" placeholder="请输入成交价" />
                        </el-form-item>
                        <el-form-item label="手数" prop="hands">
                            <el-input-number v-model="formData.hands" :controls="false" placeholder="请输入手数" />
                        </el-form-item>
                    </el-form>
                    <div style="padding-left: 24px;">
                        <el-button color="#eb4436" type="primary" @click="submitHandle(1, 1)">买入</el-button>
                        <el-button color="#21a67a" type="primary" @click="submitHandle(0, 1)">卖出</el-button>
                        <el-button type="primary" :disabled="!buySaleListNum.buyListNum" @click="submitHandle(0, 0)">平多</el-button>
                        <el-button type="primary" :disabled="!buySaleListNum.saleListNum" @click="submitHandle(1, 0)">平空</el-button>
                    </div>
                </div>
                <el-table class="opening-order-talbe" :data="openingTableData" border>
                    <el-table-column prop="name" label="合约" width="90" fixed="left" />
                    <el-table-column prop="buyOrSale" label="多/空">
                        <template #default="scope">
                            <span :style="scope.row.buyOrSale ? { color: '#eb4436' } : { color: '#0e9d58' }">
                                {{scope.row.buyOrSale ? '多' : '空'}}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="price" label="开仓均价" />
                    <el-table-column prop="hands" label="手数" />
                    <el-table-column prop="commission" label="开仓总手续费" />
                </el-table>
            </el-tab-pane>
            <el-tab-pane label="交易记录" name="table">
                <el-table class="order-talbe" :data="tableData" :row-class-name="tableRowClassName">
                    <el-table-column prop="id" label="成交序号" width="90" fixed="left" />
                    <el-table-column prop="name" label="合约" width="90" fixed="left" />
                    <el-table-column prop="buyOrSale" label="买/卖">
                        <template #default="scope">
                            <span :style="scope.row.buyOrSale ? { color: '#eb4436' } : { color: '#0e9d58' }">
                                {{scope.row.buyOrSale ? '买' : '卖'}}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="price" label="成交价" />
                    <el-table-column prop="commission" label="手续费" />
                    <el-table-column prop="hands" label="手数" />
                    <el-table-column prop="openOrClose" label="开/平">
                        <template #default="scope">
                            <span>{{scope.row.openOrClose ? '开' : '平'}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="date" label="交易时间" width="180" />
                    <el-table-column prop="closeHands" label="状态">
                        <template #default="scope">
                            <span v-if="(scope.row.closeHands === null)">--</span>
                            <span v-else-if="scope.row.closeHands === 0">未平</span>
                            <span v-else-if="scope.row.closeHands === scope.row.hands">全平</span>
                            <span v-else>已平{{scope.row.closeHands}}手</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="linkId" label="关联序号" />
                    <el-table-column prop="profit" label="平仓盈亏" width="90" fixed="right" align="center">
                        <template #default="scope">
                            <div v-if="(scope.row.profit || scope.row.profit === 0)"
                                :style="scope.row.profit > 0 ? { color: '#eb4436' } : { color: '#0e9d58' }">
                                <span style="font-weight: bold;">{{scope.row.profit}}</span>
                            </div>
                            <div v-else class="talbe-block-cell">--</div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="totalProfit" label="净盈亏" width="90" fixed="right" align="center">
                        <template #default="scope">
                            <div v-if="(scope.row.totalProfit || scope.row.totalProfit === 0)"
                                :style="scope.row.totalProfit > 0 ? { color: '#eb4436' } : { color: '#0e9d58' }">
                                <span style="font-weight: bold;">{{scope.row.totalProfit}}</span>
                            </div>
                            <div v-else class="talbe-block-cell">--</div>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" fixed="right" align="center" width="72">
                        <template #default="scope">
                            <el-button link
                                type="danger"
                                size="small"
                                @click.prevent="deleteRow(scope)">
                                删除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { fetchOrderInfo, fetchInsertOrder, fetchDeleteOrder, fetchFutureConfigInfo, fetchOpeningOrderInfo } from '@/api'
import { dateFormat } from '@/libs/util'
import { numMap } from './index.js'
import { ElMessage } from 'element-plus'

export default {
    name: 'order',
    setup() {
        const store = new useStore()
        const date = new Date()
        const tableData = ref([])
        const openingTableData = ref([])
        const commissionList = ref([])
        const futuresList = ref([])
        const futureConfigInfo = ref([])
        const ruleFormRef = ref()
        const formData = reactive({
            date,
            name: '',
            buyOrSale: 0,
            openOrClose: 0,
            hands: 1,
            price: 0,
            commissionId: '',
        })
        const rules = reactive({
            date: [{ required: true, message: '请选择日期', trigger: 'change' }],
            name: [{ required: true, message: '请选择合约', trigger: 'change' }],
            hands: [{ required: true, message: '请输入手数', trigger: 'change' }],
            price: [{ required: true, message: '请输入成交价', trigger: 'change' }],
            commissionId: [{ required: true, message: '请选择手续费配置', trigger: 'change' }],
        })

        const activeName = computed({
            get() {
                return store.state.app.activeOrderTab
            },
            set(value) {
                setActiveOrderTab(value)
            },
        })

        // 合约列表
        const futuresConfigList = computed(() => {
            const list = []
            const dateList = []
            let year = Number(dateFormat(date, 'yy'))
            let month = Number(dateFormat(date, 'MM'))
            
            for (let i = 0; i < 7; i++) {
                if (month < 10) {
                    dateList.push(`${year}0${month}`)
                } else {
                    dateList.push(`${year}${month}`)
                }
                month ++
                if (month > 12) {
                    year ++
                    month = 1
                }
            }

            futuresList.value.forEach(item => {
                dateList.forEach(cell => {
                    list.push(`${item}${cell}`)
                })
            })
            return list
        })

        const buySaleListNum = computed(() => {
            const buyList = openingTableData.value.filter(item => item.buyOrSale === 1 && formData.name === item.name) // 多单列表
            const saleList = openingTableData.value.filter(item => item.buyOrSale === 0 && formData.name === item.name) // 空单列表
            return {
                buyListNum: buyList.length, // 多单列表为空
                saleListNum: saleList.length,
            }
        })

        const setActiveOrderTab = (value) => store.commit('app/setActiveOrderTab', value)

        const tableRowClassName = ({ row }) => {
            if (!row.openOrClose) {
                return 'negative-row'
            } else if (row.closeHands === row.hands) { // 已被全平
                return 'disable-row'
            }
        }

        const getTableData = async () => {
            const res = await fetchOrderInfo()
            res.data.sort((a, b) => Date.parse(new Date(b.date)) - Date.parse(new Date(a.date)))
            tableData.value = res.data || []
        }

        const handleClick = async () => {
            if (activeName.value === 'table') {
                getTableData()
            } else {
                getOpeningTableData()
            }
        }

        const deleteRow = async (data) => {
            await fetchDeleteOrder(data.row.id)
            getTableData()
        } 

        /**
         * @param {*} buyOrSale 1买，0卖
         * @param {*} openOrClose 1开，0平
         */
        const submitHandle = async (buyOrSale, openOrClose) => {
            const valid = await ruleFormRef.value.validate().catch(e => e)
            if (valid !== true) return
            
            formData.buyOrSale = buyOrSale
            formData.openOrClose = openOrClose
            formData.date = dateFormat(formData.date, 'yyyy-MM-dd hh:mm:ss')
            const data = await fetchInsertOrder(formData) || {}
            const { success } = data
            if (success) {
                ElMessage.success('操作成功')
                getOpeningTableData()
            }
        }

        const getOpeningTableData = async () => {
            const res = await fetchOpeningOrderInfo()
            const formatArr = []
            const groupObj = {}
            res.data.forEach(item => {
                if (!groupObj[`${item.name}${item.buyOrSale}`]) {
                    groupObj[`${item.name}${item.buyOrSale}`] = []
                }
                groupObj[`${item.name}${item.buyOrSale}`].push(item)
            })
            Object.keys(groupObj).forEach(key => {
                const itemObj = { ...groupObj[key][0] }
                let totalHands = 0
                let totalPrice = 0
                let totalCommission = 0
                groupObj[key].forEach(item => {
                    const { closeHands = 0, hands, price, commission } = item
                    const preCommission = commission / hands
                    totalHands += hands
                    totalHands -= closeHands
                    totalPrice += (hands - closeHands) * price
                    totalCommission += (hands - closeHands) * preCommission
                })
                itemObj.price = (totalPrice / totalHands).toFixed(3)
                itemObj.hands = totalHands
                itemObj.commission = totalCommission.toFixed(2)
                formatArr.push(itemObj)
            })
            openingTableData.value = formatArr
        }

        const getFutureConfigInfo = async () => {
            const res = await fetchFutureConfigInfo()
            futureConfigInfo.value = res.data || []
        }

        const changeOrderName = () => { // 切换合约
            // 更新手续费列表
            commissionList.value = futureConfigInfo.value.filter(item => formData.name.indexOf(item.name) > -1)
            commissionList.value.sort((a, b) => a.type - b.type)
            // 更新默认选中的手续费
            formData.commissionId = commissionList.value[0].id
            localStorage.setItem('default-order-name', formData.name)
        }

        onMounted(async () => {
            getOpeningTableData()
            await getFutureConfigInfo()
            futuresList.value = [...new Set(futureConfigInfo.value.map(item => item.name))] // 设置合约列表
            // 设置默认选中的合约
            const defaultOrderName = localStorage.getItem('default-order-name')
            if (defaultOrderName) {
                formData.name = defaultOrderName
            } else {
                formData.name = futuresConfigList.value[0]
            }

            // 设置手续费列表
            commissionList.value = futureConfigInfo.value.filter(item => formData.name.indexOf(item.name) > -1)
            commissionList.value.sort((a, b) => a.type - b.type)
            if (commissionList.value.length) {
                formData.commissionId = commissionList.value[0].id // 设置默认选中的手续费
            }
        })

        return {
            numMap,
            futuresConfigList,
            formData,
            rules,
            tableData,
            openingTableData,
            activeName,
            ruleFormRef,
            commissionList,
            buySaleListNum,
            tableRowClassName,
            submitHandle,
            handleClick,
            deleteRow,
            changeOrderName,
        }
    },
}
</script>

<style scoped>
#pane-add {
    overflow: auto;
}
.order-wrap {
    background: #fff;
    position: relative;
    height: 100%;
    box-sizing: border-box;
}
.order-talbe {
    width: 100%;
    height: 100%;
    background: white;
    font-size: 12px;
}
.opening-order-talbe {
    width: calc(100% - 48px);
    max-height: 200px;
    font-size: 12px;
    margin: 16px 24px;
}
</style>

<style>
.order-tab {
    height: 100%;
}
.order-tab .el-tabs__nav-scroll {
    padding-left: 12px;
}
.order-tab .el-tabs__content {
    height: calc(100% - 55px);
}
.order-tab .el-tab-pane {
    height: 100%;
}
.order-tab .el-table__inner-wrapper {
    height: 100%;
}
.order-tab .el-table__body-wrapper {
    height: calc(100% - 40px);
}
.order-tab .el-table .positive-row .el-table__cell {
    color: rgb(255, 36, 54);
}
.order-tab .el-table .negative-row .el-table__cell {
    background: var(--el-color-success-light-9);
}
.order-tab .el-table .disable-row .el-table__cell {
    background: var(--el-color-info-light-9);
    color: var(--el-color-info-light-5);
}

</style>
