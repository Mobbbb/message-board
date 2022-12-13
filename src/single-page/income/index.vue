<template>
    <div class="income-wrap">
        <el-tabs v-model="activeName" @tab-click="handleClick" class="chart-tab">
            <el-tab-pane label="日收益" name="day">
                <div id="incomeChart1"></div>
            </el-tab-pane>
            <el-tab-pane label="累计收益" name="add">
                <div id="incomeChart2"></div>
            </el-tab-pane>
            <el-tab-pane label="收益列表" name="table">
                <div class="table-wrap">
                    <el-table :data="showListData" height="100%" style="font-size: 12px;">
                        <el-table-column prop="date" label="日期" />
                        <el-table-column prop="num" label="收益" />
                        <el-table-column prop="showName" label="角色" />
                        <el-table-column prop="username" label="账户" />
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
                        <el-select v-model="name" multiple placeholder="请选择角色">
                            <el-option label="金" value="j"></el-option>
                            <el-option label="银" value="y"></el-option>
                            <el-option label="其他" value="other"></el-option>
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
    </div>
</template>

<script>
import { ref, nextTick, onMounted, onBeforeUnmount, computed } from 'vue'
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
        const date = ref(new Date())
        const num = ref(0)
        const remark = ref('')
        const name = ref(['j', 'y'])
        const currentPage = ref(1)

        const pageSize = 40
        const festivalList = ['2022-09-10', '2022-09-11', '2022-09-12', '2022-10-01', '2022-10-02', '2022-10-03', 
            '2022-10-04', '2022-10-05', '2022-10-06', '2022-10-07']

        let result1 = []
        let result2 = []
        let result3 = []

        let myChart1 = null
        let myChart2 = null

        const setActiveTabName = (value) => store.commit('app/setActiveTabName', value)

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
            await getTableData()
            handleClick()
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

        const getDayIncome = () => {
            setChartData()

            nextTick(() => {
                document.getElementById('incomeChart1').removeAttribute('_echarts_instance_')
                myChart1 = echarts.init(document.getElementById('incomeChart1'))
                myChart1.setOption(getOption(result1, result2, result3))
            })
        }

        const getTotalIncome = () => {
            setChartData()

            let data1 = []
            let data2 = []
            let data3 = []
            result1.forEach((item, index) => {
                if (index) {
                    data1.push({
                        num: item.num + data1[index - 1].num,
                        date: item.date,
                    })
                } else {
                    data1.push(item)
                }
            })
            result2.forEach((item, index) => {
                if (index) {
                    data2.push({
                        num: item.num + data2[index - 1].num,
                        date: item.date,
                    })
                } else {
                    data2.push(item)
                }
            })
            result3.forEach((item, index) => {
                if (index) {
                    data3.push({
                        num: item.num + data3[index - 1].num,
                        date: item.date,
                    })
                } else {
                    data3.push(item)
                }
            })

            nextTick(() => {
                document.getElementById('incomeChart2').removeAttribute('_echarts_instance_')
                myChart2 = echarts.init(document.getElementById('incomeChart2'))
                myChart2.setOption(getOption(formatData(data1), formatData(data2), formatData(data3), true))
            })
        }

        const setChartData = () => {
            result1 = []
            result2 = []
            result3 = []
            tableData.value.forEach(item => {
                if (!Array.isArray(item.name)) {
                    item.name = item.name.split(',')
                }
                if (item.name.includes('j')) {
                    result1.push(item)
                }
                if (item.name.includes('y')) {
                    result2.push(item)
                }
                if (item.name.includes('other')) {
                    result3.push(item)
                }
            })

            result1 = formatData(result1)
            result2 = formatData(result2)
            result3 = formatData(result3)
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

        const formatData = (data) => {
            let result = []
            if (!data.length) return []
            data.sort((a, b) => Date.parse(new Date(b.date)) - Date.parse(new Date(a.date)))
            let dateArr = getDateBetween(data[data.length - 1].date, dateFormat(new Date()))

            dateArr = dateArr.filter(item => !festivalList.includes(item))

            dateArr.forEach(item => {
                let flag = null
                data.forEach(cell => {
                    if (cell.date === item) {
                        flag = cell
                    }
                })

                if (flag) {
                    result.push(flag)
                } else {
                    const dateTime = new Date(item)
                    if (dateTime.getDay() !== 0 && dateTime.getDay() !== 6) {
                        result.push({
                            date: item,
                            num: 0,
                        })
                    }
                }
            })
            
            return result
        }

        const getTableData = async () => {
            const nameMap = {
                'j': '小金',
                'y': '小银',
                'other': '其他',
            }
            const res = await fetchIncomeInfo()
            const data = res.data || []
            data.sort((a, b) => Date.parse(new Date(b.date)) - Date.parse(new Date(a.date)))
            data.forEach(item => {
                if (!Array.isArray(item.name)) {
                    item.name = item.name.split(',')
                }
                const nameArr = []
                item.name.forEach(cell => {
                    nameArr.push(nameMap[cell])
                })
                item.showName = nameArr.join('、')
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
            await fetchInsertIncome(params)
            getTableData()
            name.value = ['j', 'y']
            num.value = 0
            remark.value = ''
            ElMessage.success('录入成功')
        }

        const deleteRow = async (data) => {
            await fetchDeleteIncome(data.row.id)
            getTableData()
        }

        return {
            tableData,
            showListData,
            activeName,
            date,
            num,
            name,
            remark,
            pageSize,
            currentPage,
            submitHandle,
            deleteRow,
            handleClick,
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
