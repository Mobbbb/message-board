<template>
    <div class="order-wrap">
        <el-tabs v-model="activeName" @tab-click="handleClick" class="order-tab">
            <el-tab-pane label="开 / 平仓" name="add">
                <div class="table-wrap">
                    <el-form :model="buyForm" label-width="95px" label-position="left"
                        ref="ruleFormRef"
                        :rules="rules"
                        style="width: 400px;padding-left: 24px;">
                        <el-form-item label="交易日期" prop="date">
                            <el-date-picker v-model="buyForm.date" type="datetime" placeholder="请选择日期" :editable="false" :clearable="false" />
                        </el-form-item>
                        <el-form-item label="合约" prop="name">
                            <el-select v-model="buyForm.name" placeholder="请选择合约" filterable @change="changeOrderName">
                                <el-option :label="item" :value="item" v-for="item in futuresConfigList" :key="item"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="手续费配置" prop="commissionId">
                            <el-select v-model="buyForm.commissionId" placeholder="请选择手续费" filterable>
                                <el-option :label="numMap[item.type] + '倍'" :value="item.id" v-for="item in commissionList" :key="item.id"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="成交价" prop="price">
                            <el-input-number v-model="buyForm.price" :controls="false" placeholder="请输入成交价" />
                        </el-form-item>
                        <el-form-item label="手数" prop="hands">
                            <el-input-number v-model="buyForm.hands" :controls="false" placeholder="请输入手数" />
                        </el-form-item>
                    </el-form>
                    <div style="padding-left: 24px;">
                        <el-button type="primary" @click="submitHandle(1, 1)">多开</el-button>
                        <el-button type="primary" @click="submitHandle(0, 1)">空开</el-button>
                        <el-button type="danger" @click="submitHandle(0, 0)">平多</el-button>
                        <el-button type="danger" @click="submitHandle(1, 0)">平空</el-button>
                    </div>
                </div>
            </el-tab-pane>
            <el-tab-pane label="交易记录" name="table">
                <el-table class="order-talbe" :data="tableData" :row-class-name="tableRowClassName">
                    <el-table-column prop="name" label="合约" width="90" fixed="left" />
                    <el-table-column prop="buyOrSale" label="多/空">
                        <template #default="scope">
                            <span>{{scope.row.buyOrSale ? '多' : '空'}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="price" label="成交价" />
                    <el-table-column prop="hands" label="手数" />
                    <el-table-column prop="openOrClose" label="开/平">
                        <template #default="scope">
                            <span>{{scope.row.openOrClose ? '开' : '平'}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="date" label="交易时间" width="180" />
                    <el-table-column prop="closeStatus" label="状态">
                        <template #default="scope">
                            <span v-if="!scope.row.openOrClose">--</span>
                            <span v-else-if="scope.row.closeStatus === 1">全平</span>
                            <span v-else-if="scope.row.closeStatus === 2">部分平</span>
                            <span v-else>未平</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="commission" label="手续费" width="70" fixed="right" align="center" />
                    <el-table-column prop="profit" label="盈亏" width="90" fixed="right" align="center">
                        <template #default="scope">
                            <div v-if="(scope.row.profit || scope.row.profit === 0)">{{scope.row.profit}}</div>
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
import { fetchOrderInfo, fetchInsertOrder, fetchDeleteOrder, fetchFutureConfigInfo } from '@/api'
import { dateFormat } from '@/libs/util'
import { numMap } from './index.js'
import { ElMessage } from 'element-plus'

export default {
    name: 'order',
    setup() {
        const store = new useStore()
        const date = new Date()
        const tableData = ref([])
        const commissionList = ref([])
        const futuresList = ref([])
        const futureConfigInfo = ref([])
        const ruleFormRef = ref()
        const buyForm = reactive({
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

        const setActiveOrderTab = (value) => store.commit('app/setActiveOrderTab', value)

        const tableRowClassName = ({ row }) => {
            if (!row.openOrClose) {
                return 'success-row'
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
            
            buyForm.buyOrSale = buyOrSale
            buyForm.openOrClose = openOrClose
            buyForm.date = dateFormat(buyForm.date, 'yyyy-MM-dd hh:mm:ss')
            const data = await fetchInsertOrder(buyForm) || {}
            const { success } = data
            if (success) {
                ElMessage.success('操作成功')
                // ruleFormRef.value.resetFields()
            }
        }

        const getFutureConfigInfo = async () => {
            const res = await fetchFutureConfigInfo()
            futureConfigInfo.value = res.data || []
        }

        const changeOrderName = () => { // 切换合约
            // 更新手续费列表
            commissionList.value = futureConfigInfo.value.filter(item => buyForm.name.indexOf(item.name) > -1)
            commissionList.value.sort((a, b) => a.type - b.type)
            // 更新默认选中的手续费
            buyForm.commissionId = commissionList.value[0].id
        }

        onMounted(async () => {
            await getFutureConfigInfo()
            futuresList.value = [...new Set(futureConfigInfo.value.map(item => item.name))] // 设置合约列表
            buyForm.name = futuresConfigList.value[0] // 设置默认选中的合约
            // 设置手续费列表
            commissionList.value = futureConfigInfo.value.filter(item => buyForm.name.indexOf(item.name) > -1)
            commissionList.value.sort((a, b) => a.type - b.type)
            buyForm.commissionId = commissionList.value[0].id // 设置默认选中的手续费
        })

        return {
            numMap,
            futuresConfigList,
            buyForm,
            rules,
            tableData,
            activeName,
            ruleFormRef,
            commissionList,
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
.order-tab .el-table .success-row .el-table__cell {
    background: var(--el-color-success-light-9);
}
</style>
