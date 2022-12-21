<template>
    <div class="order-wrap">
        <el-tabs v-model="activeName" @tab-click="handleClick" class="order-tab">
            <el-tab-pane label="开 / 平仓" name="add">
                <div class="table-wrap">
                    <el-form :model="formData" label-width="95px" label-position="left"
                        ref="ruleFormRef"
                        :rules="rules"
                        style="width: 325px;padding-left: 24px;">
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
                <el-table class="opening-order-table" :data="openingTableData" border>
                    <el-table-column prop="name" label="合约" width="70" fixed="left" />
                    <el-table-column prop="buyOrSale" width="60" label="多/空">
                        <template #default="scope">
                            <span :style="scope.row.buyOrSale ? { color: '#eb4436' } : { color: '#0e9d58' }">
                                {{scope.row.buyOrSale ? '多' : '空'}}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="price" label="开仓均价" />
                    <el-table-column prop="hands" label="手数" />
                    <el-table-column prop="commission" width="120" label="开仓总手续费" />
                </el-table>
            </el-tab-pane>
            <el-tab-pane label="交易记录" name="table" ref="tableTabWrap">
                <div class="table-search-input-wrap" ref="searchInputWrap">
                    <div class="search-item-wrap">
                        <span>起止日期：</span>
                        <el-date-picker
                            v-model="searchParams.date"
                            type="daterange"
                            unlink-panels
                            range-separator="To"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"
                            :clearable="false"
                            :shortcuts="shortcuts"
                            @change="changeDateHandle"
                            class="date-picker"
						    popper-class="date-picker-popper"
                            style="width: 260px;" />
                    </div>
                    <div class="search-item-wrap">
                        <span>合约名：</span>
                        <el-input v-model="searchParams.name" placeholder="请输入合约名" style="width: 120px;" />
                    </div>
                    <div class="search-item-wrap">
                        <span>开/平：</span>
                        <el-select v-model="searchParams.openOrClose" style="width: 120px;">
                            <el-option label="平" :value="0"></el-option>
                            <el-option label="开" :value="1"></el-option>
                        </el-select>
                    </div>
                    <div class="search-item-wrap">
                        <span>状态：</span>
                        <el-select v-model="searchParams.status" style="width: 120px;">
                            <el-option label="全部" :value="0"></el-option>
                            <el-option label="已平" :value="1"></el-option>
                            <el-option label="未平" :value="2"></el-option>
                        </el-select>
                    </div>
                    <div class="search-item-wrap">
                        <el-button type="primary" @click="searchHandle">搜索</el-button>
                        <el-button @click="resetHandle">重置</el-button>
                    </div>
                </div>
                <el-table class="order-table" 
                    :height="orderTableHeight"
                    show-summary 
                    :data="tableData"
                    :summary-method="getSummaries"
                    :row-class-name="tableRowClassName">
                    <el-table-column prop="name" label="合约" width="70" fixed="left" />
                    <el-table-column prop="buyOrSale" label="买/卖" width="60" align="center">
                        <template #default="scope">
                            <span :style="scope.row.buyOrSale ? { color: '#eb4436' } : { color: '#0e9d58' }">
                                {{scope.row.buyOrSale ? '买' : '卖'}}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="price" label="成交价" />
                    <el-table-column prop="hands" label="手数" />
                    <el-table-column prop="commission" label="手续费" />
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
                            <span v-else-if="scope.row.closeHands === scope.row.hands">已平</span>
                            <span v-else>已平{{scope.row.closeHands}}手</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="id" label="成交序号" width="90" />
                    <el-table-column prop="linkId" label="关联序号" />
                    <el-table-column prop="profit" label="平仓盈亏" width="90" align="center">
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
                    <el-table-column label="操作" align="center" width="72">
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
        <el-dialog v-model="centerDialogVisible"
            title="警告"
            width="280px">
            <span>确定要删除吗？</span>
            <template #footer>
                <span class="dialog-footer">
                    <el-button type="danger" @click="confirmDelete">确定</el-button>
                    <el-button @click="centerDialogVisible = false">取消</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import { useStore } from 'vuex'
import { fetchOrderInfo, fetchInsertOrder, fetchDeleteOrder, fetchOpeningOrderInfo } from '@/api'
import { dateFormat } from '@/libs/util'
import { numMap } from './index.js'
import { ElMessage } from 'element-plus'

export default {
    name: 'order',
    setup() {
        const date = new Date()
        const getMonthShortcuts = () => {
            let year = date.getFullYear()
            let month = date.getMonth() + 1
            const monthShortcuts = []
            for (let i = 0; i < 5; i++) {
                year = month < 1 ? year - 1 : year
                month = month < 1 ? month + 12 : month
                let nMonth = (month + 1) > 12 ? (month + 1) - 12 : (month + 1)
                let nYear = (month + 1) > 12 ? year + 1 : year

                const nextMonth = new Date(nYear, nMonth - 1, 1)
                let nPrevDay = Date.parse(nextMonth) - 24 * 60 * 60 * 1000
                
                monthShortcuts.push({
                    text: month < 10 ? `${year}.${'0' + month}` : `${year}.${month}`,
                    value: [new Date(year, month - 1, 1), dateFormat(nPrevDay, 'yyyy-MM-dd')],
                })
                month--
            }
            return monthShortcuts
        }

        const monthShortcuts = getMonthShortcuts()
        const store = new useStore()
        const tableData = ref([])
        const openingTableData = ref([])
        const commissionList = ref([])
        const ruleFormRef = ref()
        const searchInputWrap = ref()
        const tableTabWrap = ref()
        const orderTableHeight = ref(0)
        const centerDialogVisible = ref(false)
        const formData = reactive({
            date,
            name: '',
            buyOrSale: 0,
            openOrClose: 0,
            hands: 1,
            price: 0,
            commissionId: '',
        })
        
        const searchParams = reactive({
            date: monthShortcuts[0].value,
            name: '',
            openOrClose: '',
            startDate: '',
            endDate: '',
            status: 0,
        })

        const shortcuts = [
            {
                text: '近7天',
                value: () => {
                    const end = new Date()
                    const start = new Date()
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
                    return [start, end]
                },
            },
            {
                text: '近30天',
                value: () => {
                    const end = new Date()
                    const start = new Date()
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
                    return [start, end]
                },
            },
            ...monthShortcuts,
        ]
        const rules = reactive({
            date: [{ required: true, message: '请选择日期', trigger: 'change' }],
            name: [{ required: true, message: '请选择合约', trigger: 'change' }],
            hands: [{ required: true, message: '请输入手数', trigger: 'change' }],
            price: [{ required: true, message: '请输入成交价', trigger: 'change' }],
            commissionId: [{ required: true, message: '请选择手续费配置', trigger: 'change' }],
        })

        const futureConfigInfo = computed(() => store.state.app.futureConfigInfo)
        const futuresList = computed(() => store.getters['app/futuresList'])
        const isLogin = computed(() => store.getters['app/isLogin'])
        const getFutureConfigInfo = () => store.dispatch('app/getFutureConfigInfo')
        const setLoginDrawerStatus = (status) => store.commit('app/setLoginDrawerStatus', status)

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
            if (!isLogin.value) return
            if (searchParams.date[0]) {
                let prevDay = Date.parse(new Date(searchParams.date[0])) - 24 * 60 * 60 * 1000
                if (new Date(prevDay).getDay() === 0) { // 前一天是周日
                    prevDay -= 2 * 24 * 60 * 60 * 1000
                }
                if (new Date(prevDay).getDay() === 6) { // 前一天是周六
                    prevDay -= 1 * 24 * 60 * 60 * 1000
                }
                searchParams.startDate = dateFormat(prevDay, 'yyyy-MM-dd') + ' 21:00:00'
            }
            if (searchParams.date[1]) {
                searchParams.endDate = dateFormat(searchParams.date[1], 'yyyy-MM-dd') + ' 20:59:59'
            }
            const res = await fetchOrderInfo(searchParams)
            const data = res.data || []
            tableData.value = data || []
        }

        const handleClick = async () => {
            if (activeName.value === 'table') {
                getTableData()
                nextTick(() => {
                    if (!orderTableHeight.value) {
                        orderTableHeight.value = tableTabWrap.value.$el.clientHeight - searchInputWrap.value.clientHeight
                    }
                })
            } else {
                getOpeningTableData()
            }
        }

        let currentDeleteItem = null
        const deleteRow = async (data) => {
            currentDeleteItem = data
            centerDialogVisible.value = true
        }

        const confirmDelete = async () => {
            if (currentDeleteItem) {
                await fetchDeleteOrder(currentDeleteItem.row.id)
                getTableData()
            }
            centerDialogVisible.value = false
        }

        /**
         * @param {*} buyOrSale 1买，0卖
         * @param {*} openOrClose 1开，0平
         */
        const submitHandle = async (buyOrSale, openOrClose) => {
            if (!isLogin.value) {
                setLoginDrawerStatus(true)
            } else {    
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
        }

        const getOpeningTableData = async () => {
            if (!isLogin.value) return
            const res = await fetchOpeningOrderInfo()
            const data = res.data || []
            const formatArr = []
            const groupObj = {}
            data.forEach(item => {
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

        const changeOrderName = () => { // 切换合约
            setCommissionList() // 更新手续费标准
            localStorage.setItem('default-order-name', formData.name)
        }

        const getSummaries = (param) => {
            const { columns, data } = param
            const sums = []
            const calcPropertyArr = ['totalProfit', 'commission', 'profit']
            columns.forEach((column, index) => {
                if (index === 0) {
                    sums[index] = '合计'
                    return
                }
                if (!calcPropertyArr.includes(column.property)) {
                    sums[index] = '--'
                    return
                }
                const values = data.map((item) => Number(item[column.property]))
                if (!values.every((value) => Number.isNaN(value))) {
                    sums[index] = values.reduce((prev, curr) => {
                        const value = Number(curr)
                        if (!Number.isNaN(value)) {
                            return prev + curr
                        } else {
                            return prev
                        }
                    }, 0)
                    sums[index] = sums[index].toFixed(2)
                } else {
                    sums[index] = '--'
                }
            })
            return sums
        }
        
        const searchHandle = () => {
            getTableData()
        }

        const changeDateHandle = () => {
            getTableData()
        }

        const resetHandle = () => {
            searchParams.name = ''
            searchParams.openOrClose = ''
            searchParams.date = monthShortcuts[0].value
            searchParams.startDate = ''
            searchParams.endDate = ''
            searchParams.status = 0
            getTableData()
        }

        watch(isLogin, (value) => {
            if (value) {
                handleClick()
            } else {
                tableData.value = []
                openingTableData.value = []
            }
        })

        onMounted(async () => {
            handleClick()
            await getFutureConfigInfo()
            // 设置默认选中的合约
            const defaultOrderName = localStorage.getItem('default-order-name')
            if (defaultOrderName) {
                formData.name = defaultOrderName
            } else {
                formData.name = futuresConfigList.value[0]
            }

            setCommissionList() // 设置手续费标准
        })

        // 设置手续费标准
        const setCommissionList = () => {
            commissionList.value = futureConfigInfo.value.filter(item => formData.name.indexOf(item.name) > -1)
            commissionList.value.sort((a, b) => a.type - b.type)
            if (commissionList.value.length) {
                formData.commissionId = commissionList.value[0].id // 设置默认选中的手续费标准
            }
        }

        return {
            centerDialogVisible,
            numMap,
            futuresConfigList,
            formData,
            rules,
            tableData,
            openingTableData,
            activeName,
            ruleFormRef,
            searchInputWrap,
            tableTabWrap,
            commissionList,
            buySaleListNum,
            orderTableHeight,
            shortcuts,
            searchParams,
            tableRowClassName,
            submitHandle,
            handleClick,
            deleteRow,
            changeOrderName,
            getSummaries,
            searchHandle,
            resetHandle,
            changeDateHandle,
            confirmDelete,
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
.order-table {
    width: 100%;
    background: white;
    font-size: 12px;
}
.opening-order-table {
    width: calc(100% - 48px);
    max-height: 200px;
    font-size: 12px;
    margin: 16px 24px;
}
.table-search-input-wrap {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    padding-left: 12px;
    font-size: 12px;
}
.search-item-wrap {
    display: flex;
    align-items: center;
    color: #606266;
    margin: 0 24px 12px 0;
}
.search-item-wrap span {
    flex-shrink: 0;
}
</style>

<style>
.order-table .el-table__body-wrapper {
    position: relative;
}
.order-table .el-table__empty-block {
    position: absolute;
    max-height: 60px;
    max-width: 100px;
    left: 0;
    right: 0;
    margin: 0 auto;
}
.order-tab {
    height: 100%;
}
.order-tab .el-tabs__content {
    height: calc(100% - 55px);
}
.order-tab .el-tab-pane {
    height: 100%;
}
.order-tab .el-tabs__nav-scroll {
    padding-left: 12px;
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
.order-table.el-table.has-footer .el-table__inner-wrapper::before {
    bottom: 0;
}
</style>
