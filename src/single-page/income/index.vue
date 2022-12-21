<template>
    <div class="income-wrap">
        <el-tabs v-model="activeName" @tab-click="handleClick" class="chart-tab" v-if="isLogin">
            <el-tab-pane label="日收益" name="day">
                <div id="incomeChart1" v-if="isShowChart"></div>
                <div class="no-data-class" v-if="!isShowChart">
                    <div><blockquote>暂无数据</blockquote></div>
                </div>
            </el-tab-pane>
            <el-tab-pane label="累计收益" name="add">
                <div id="incomeChart2" v-if="isShowChart"></div>
                <div class="no-data-class" v-if="!isShowChart">
                    <div><blockquote>暂无数据</blockquote></div>
                </div>
            </el-tab-pane>
            <el-tab-pane label="收益列表" name="table">
                <div class="table-wrap">
                    <el-table :data="showListData" height="100%" style="font-size: 12px;">
                        <el-table-column prop="date" label="日期" />
                        <el-table-column prop="num" label="收益" />
                        <el-table-column prop="name" label="角色" />
                        <el-table-column prop="remark" label="备注" />
                        <el-table-column fixed="right" label="操作" width="60" align="center">
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
                </div>
                <el-pagination small background layout="prev, jumper, next, total" 
                    v-model:currentPage="currentPage"
                    :page-size="pageSize"
                    :total="tableData.length"
                    class="income-pagination" />
            </el-tab-pane>
            <el-tab-pane label="收益录入" name="submit">
                <div class="table-input-wrap">
                    <div class="table-input-item-wrap">
                        <span>日期：</span>
                        <el-date-picker v-model="date" type="date" placeholder="请选择日期" :editable="false" :clearable="false" />
                    </div>
                    <div class="table-input-item-wrap">
                        <span>收益：</span>
                        <el-input-number v-model="num" :controls="false" style="width: 80px;" />
                    </div>
                    <div class="table-input-item-wrap">
                        <span>角色：</span>
                        <el-select v-model="name" multiple placeholder="请选择角色" style="width: 240px;">
                            <el-option :label="item" :value="item" v-for="item in accountName" :key="item"></el-option>
                        </el-select>
                    </div>
                    <div class="table-input-item-wrap">
                        <span>备注：</span>
                        <el-input v-model="remark" type="textarea" />
                    </div>
                    <div style="margin: 16px 0 0 36px;">
                        <el-button type="primary" @click="submitHandle">录入</el-button>
                    </div>
                </div>
            </el-tab-pane>
        </el-tabs>
        <div class="no-data-class login-wrap" v-else>
            <div>
                <blockquote>您当前还未登录</blockquote>
                <div class="no-data-btn" @click="showLoginHandle">前往登录</div>
            </div>
        </div>
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
import { ref, nextTick, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { getOption } from './option'
import { fetchIncomeInfo, fetchInsertIncome, fetchDeleteIncome } from '@/api'
import { getDateBetween, dateFormat } from '@/libs/util'
import { ElMessage } from 'element-plus'

export default {
    name: 'income',
    setup() {
        const store = new useStore()
        const tableData = ref([])
        const chartDataArr = ref([])
        const chartDataTotalArr = ref([])
        const date = ref(new Date())
        const num = ref(0)
        const name = ref([])
        const remark = ref('')
        const currentPage = ref(1)
        const centerDialogVisible = ref(false)

        const pageSize = 40
        const festivalList = ['2022-09-10', '2022-09-11', '2022-09-12', '2022-10-01', '2022-10-02', '2022-10-03', 
            '2022-10-04', '2022-10-05', '2022-10-06', '2022-10-07']

        let myChart1 = null
        let myChart2 = null

        const isLogin = computed(() => store.getters['app/isLogin'])
        const setActiveTabName = (value) => store.commit('app/setActiveTabName', value)
        const accountName = computed(() => {
            const { account = '' } = store.state.app.USER_INFO
            if (account) {
                name.value = [...account.split(',')]
                return account.split(',')
            }
            return []
        })
        const activeName = computed({
            get() {
                return store.state.app.activeTabName
            },
            set(value) {
                setActiveTabName(value)
            },
        })

        const showListData = computed(() => {
            const startNum = (currentPage.value - 1) * pageSize
            return tableData.value.slice(startNum, startNum + pageSize)
        })

        onMounted(async () => {
            if (isLogin.value) {
                await getTableData()
                handleClick()
            }
        })

        onBeforeUnmount(() => {
            if (myChart1) {
                myChart1.clear()
                myChart1.dispose()
                myChart1 = null
            }
            if (myChart2) {
                myChart2.clear()
                myChart2.dispose()
                myChart2 = null
            }
        })

        const isShowChart = computed(() => chartDataArr.value.length)

        const getDayIncome = () => {
            if (!isShowChart.value) return
            nextTick(() => {
                document.getElementById('incomeChart1').removeAttribute('_echarts_instance_')
                myChart1 = echarts.init(document.getElementById('incomeChart1'))
                myChart1.setOption(getOption(chartDataArr.value))
            })
        }

        const getTotalIncome = () => {
            if (!isShowChart.value) return
            nextTick(() => {
                document.getElementById('incomeChart2').removeAttribute('_echarts_instance_')
                myChart2 = echarts.init(document.getElementById('incomeChart2'))
                myChart2.setOption(getOption(chartDataTotalArr.value, true))
            })
        }

        const handleClick = async () => {
            if (activeName.value === 'add') {
                getTotalIncome()
            } else if (activeName.value === 'table') {
                getTableData()
            } else {
                getDayIncome()
            }
        }

        const getTableData = async () => {
            const res = await fetchIncomeInfo()
            const data = res.data || []
            data.sort((a, b) => Date.parse(new Date(b.date)) - Date.parse(new Date(a.date)))
            let nameArr = [] // 维度
            // 横坐标全部日期
            let dateArr = []
            if (data[data.length - 1]) {
                dateArr = getDateBetween(data[data.length - 1].date, dateFormat(new Date()))
            }
            // 过滤节假日
            dateArr = dateArr.filter(item => !festivalList.includes(item))
            data.forEach(item => {
                if (!Array.isArray(item.name)) {
                    item.name = item.name.split(',')
                }
                nameArr = nameArr.concat(item.name)
                nameArr = [...new Set(nameArr)]
            })
            chartDataArr.value = []
            chartDataTotalArr.value = []
            nameArr.forEach(nameItem => {
                chartDataArr.value.push({
                    name: nameItem,
                    data: [],
                })
                chartDataTotalArr.value.push({
                    name: nameItem,
                    data: [],
                })
            })
            chartDataArr.value.forEach(item => { // 装填数据
                data.forEach(cell => {
                    if (cell.name.includes(item.name)) {
                        item.data.push(cell)
                    }
                })
            })
            
            dateArr.forEach(dateItem => { // 补全横坐标
                // 过滤周末
                const dateTime = new Date(dateItem)
                if (dateTime.getDay() === 0 || dateTime.getDay() === 6) return

                chartDataArr.value.forEach(item => {
                    const lineItemDateArr = item.data.map(cell => cell.date)
                    if (!lineItemDateArr.includes(dateItem)) {
                        item.data.push({
                            date: dateItem,
                            num: 0,
                        })
                    }
                })
            })
            chartDataArr.value.forEach(item => {
                item.data.sort((a, b) => Date.parse(new Date(a.date)) - Date.parse(new Date(b.date)))
            })
            chartDataArr.value.forEach((item, index) => {
                item.data.forEach((cell, cellIndex) => {
                    if (cellIndex) {
                        chartDataTotalArr.value[index].data.push({
                            // 当前项 + 上一项
                            num: cell.num + chartDataTotalArr.value[index].data[cellIndex - 1].num,
                            date: cell.date,
                        })
                    } else {
                        chartDataTotalArr.value[index].data.push(cell)
                    }
                })
            })
            tableData.value = data
        }

        const submitHandle = async () => {
            if (!name.value.length) {
                ElMessage.error('请选择角色')
                return
            }
            const params = {
                date: dateFormat(new Date(date.value), 'yyyy-MM-dd'),
                num: num.value || 0,
                name: name.value.join(','),
                remark: remark.value,
            }
            const res = await fetchInsertIncome(params)
            if (res.success) {
                getTableData()
                name.value = [...accountName.value]
                num.value = 0
                remark.value = ''
                ElMessage.success('录入成功')
            }
        }

        let currentDeleteItem = null
        const deleteRow = async (data) => {
            currentDeleteItem = data
            centerDialogVisible.value = true
        }

        const confirmDelete = async () => {
            if (currentDeleteItem) {
                await fetchDeleteIncome(currentDeleteItem.row.id)
                getTableData()
            }
            centerDialogVisible.value = false
        }

        const setLoginDrawerStatus = (status) => store.commit('app/setLoginDrawerStatus', status)
        const showLoginHandle = () => {
            setLoginDrawerStatus(true)
        }

        watch(isLogin, async (value) => {
            if (value) {
                await getTableData()
                handleClick()
            } else {
                tableData.value = []
                chartDataArr.value = []
                chartDataTotalArr.value = []
            }
        })

        return {
            centerDialogVisible,
            isLogin,
            tableData,
            showListData,
            activeName,
            date,
            num,
            name,
            accountName,
            remark,
            pageSize,
            currentPage,
            isShowChart,
            submitHandle,
            deleteRow,
            handleClick,
            showLoginHandle,
            confirmDelete,
        }
    },
}
</script>

<style scoped>
.income-wrap {
    background: #f5f5f5;
    position: relative;
    height: 100%;
    box-sizing: border-box;
}
#incomeChart1, #incomeChart2 {
    width: 100%;
    height: 100%;
    background: white;
    padding: 0 4px 0 16px;
    box-sizing: border-box;
}
.table-wrap {
    height: calc(100% - 48px);
    margin-bottom: 12px;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
}
.table-input-wrap {
    background: #fff;
    width: 100%;
    height: 100%;
    padding: 0 12px;
    box-sizing: border-box;
}
.table-input-item-wrap {
    display: flex;
    align-items: center;
    padding-top: 16px;
    font-size: 12px;
    color: #606266;
}
.table-input-item-wrap span {
    flex-shrink: 0;
}
.no-data-class {
    height: calc(100% - 36px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: 25vh;
    box-sizing: border-box;
}
.no-data-class blockquote {
    font-size: 16px;
    color: #999;
    border-left: 4px solid #dfe2e5;
    margin: 12px 0;
    padding: 8px 0 8px 12px;
}
.no-data-class .no-data-btn {
    color: #3eaf7c;
    font-weight: 500;
    font-size: 16px;
    transition: color .2s ease;
}
.no-data-class .no-data-btn:hover {
    cursor: pointer;
    color: #79cea8;
}
.login-wrap {
    padding-bottom: 30vh;
}
</style>

<style>
.chart-tab {
    height: 100%;
}
.chart-tab .el-tabs__item {
    padding: 0 16px;
}
.chart-tab .el-tabs__content {
    height: calc(100% - 42px)!important;
}
.chart-tab .el-tabs__header {
    margin-bottom: 1px;
    background: white;
}
.chart-tab .el-tabs__nav-scroll {
    padding-left: 12px;
}
.chart-tab .el-tab-pane {
    height: 100%!important;
}
.el-table .cell {
    padding: 0 6px!important;
}
.el-table-fixed-column--right .cell {
    padding-left: 0!important;
    padding-right: 0!important;
}
.income-pagination .el-pagination__jump {
    margin-left: 0;
}
</style>
