<template>
    <div class="income-wrap">
        <el-button type="primary" size="small" @click="submitHandle" style="position: absolute;top: 110px;right: 23px;z-index: 100;" v-if="activeName === 'table'">录入</el-button>
        <el-tabs v-model="activeName" @tab-click="handleClick" class="chart-tab">
            <el-tab-pane label="日收益" name="day">
                <div id="incomeChart1"></div>
            </el-tab-pane>
            <el-tab-pane label="累计收益" name="add">
                <div id="incomeChart2"></div>
            </el-tab-pane>
            <el-tab-pane label="收益录入" name="table">
                <div class="table-wrap">
                    <el-table class="incomeTalbe" :data="tableData">
                        <el-table-column prop="date" label="日期" show-overflow-tooltip />
                        <el-table-column prop="num" label="收益" />
                        <el-table-column prop="name" label="角色" show-overflow-tooltip>
                            <template #default="scope">
                                <div>
                                    <span v-if="scope.row.name.includes('j')">小金</span>
                                    <span v-if="scope.row.name.includes('y') && scope.row.name.includes('j')">、</span>
                                    <span v-if="scope.row.name.includes('y')">小银</span>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column fixed="right" label="操作" width="70" align="center">
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
                    <div class="table-input-wrap">
                        <div>
                            <el-date-picker v-model="date" type="date" placeholder="日期" :editable="false" :clearable="false" style="width: 90px;" />
                        </div>
                        <div>
                            <el-input-number v-model="num" :controls="false" style="width: 60px;" />
                        </div>
                        <div>
                            <el-select v-model="name" multiple placeholder="角色" style="width: 130px;">
                                <el-option label="金" value="j"></el-option>
                                <el-option label="银" value="y"></el-option>
                            </el-select>
                        </div>
                        <div style="width: 74px;flex-shrink: 0;"></div>
                    </div>
                </div>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { getOption } from './option'
import { fetchIncomeInfo, fetchInsertIncome, fetchDeleteIncome } from '@/api'
import { getDateBetween, dateFormat } from '@/libs/util'
import { ElMessage } from 'element-plus'

export default {
    name: 'income',
    setup() {
        const activeName = ref('day')
        const tableData = ref([])
        const date = ref(new Date())
        const num = ref(0)
        const name = ref(['j', 'y'])

        let result1 = []
        let result2 = []

        let myChart1 = null
        let myChart2 = null

        onMounted(async () => {
            await getTableData()
            getDayIncome()
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
            setRes()

            if (!myChart1) {
                myChart1 = echarts.init(document.getElementById('incomeChart1'))
                myChart1.setOption(getOption(result1, result2))
            } else {
                myChart1.setOption(getOption(result1, result2), true)
            }
        }

        const getTotalIncome = () => {
            setRes()

            let data1 = []
            let data2 = []
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

            if (!myChart2) {
                myChart2 = echarts.init(document.getElementById('incomeChart2'))
                myChart2.setOption(getOption(formatData(data1), formatData(data2)))
            } else {
                myChart2.setOption(getOption(formatData(data1), formatData(data2)), true)
            }
        }

        const setRes = () => {
            result1 = []
            result2 = []
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
            })

            result1 = formatData(result1)
            result2 = formatData(result2)
        }

        const handleClick = async (params) => {
            if (params.props.name === 'add') {
                nextTick(() => {
                    getTotalIncome()
                })
            } else if (params.props.name === 'table') {
                getTableData()
            } else {
                getDayIncome()
            }
        }

        const formatData = (data) => {            
            let result = []
            if (!data.length) return
            data.sort((a, b) => Date.parse(new Date(b.date)) - Date.parse(new Date(a.date)))
            let dateArr = getDateBetween(data[data.length - 1].date, data[0].date)

            dateArr.forEach(item => {
                let flag = null
                data.forEach(cell => {
                    if (cell.date === item) {
                        flag = cell
                    }
                })

                if (flag) {
                    result.push(flag)
                    flag = null
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
            const res = await fetchIncomeInfo()
            res.data.sort((a, b) => Date.parse(new Date(b.date)) - Date.parse(new Date(a.date)))
            tableData.value = res.data || []
        }

        const submitHandle = async () => {
            if (!name.value.length) {
                ElMessage.error('请选择角色')
                return
            }
            const params = {
                date: dateFormat(new Date(date.value), 'yyyy-MM-dd'),
                num: num.value || 0,
                name: name.value.join(',')
            }
            await fetchInsertIncome(params)
            getTableData()
        }

        const deleteRow = async (data) => {
            await fetchDeleteIncome(data.row.id)
            getTableData()
        }

        return {
            tableData,
            activeName,
            submitHandle,
            date,
            num,
            name,
            deleteRow,
            handleClick,
        }
    },
}
</script>

<style scoped>
.income-wrap {
    background: #fff;
    position: relative;
    height: 100%;
    box-sizing: border-box;
    padding: 0 12px;
}
#incomeChart1, #incomeChart2, .incomeTalbe {
    width: 100%;
    height: 100%;
}
.table-wrap {
    height: 100%;
    box-sizing: border-box;
    padding-bottom: 12px;
    position: relative;
}
.table-input-wrap {
    position: absolute;
    display: flex;
    top: 52px;
    z-index: 10;
    width: 100%;
}
.table-input-wrap > div {
    width: 100%;
}
</style>

<style>
.chart-tab {
    height: 100%;
}
.chart-tab .el-tabs__content {
    height: calc(100% - 55px)!important;
}
.chart-tab .el-tab-pane {
    height: 100%!important;
}
.el-input--suffix .el-input__inner {
    padding-right: 6px!important;
    padding-left: 6px!important;
}
.el-tag--default .el-tag__close {
    margin-left: 0!important;
}
.el-tag--default {
    padding: 4px!important;
}
.el-table__body-wrapper {
    padding-top: 50px!important;
}
.el-table .cell {
    padding: 0 6px!important;
}
.el-input__prefix {
    display: none!important;
}
.incomeTalbe .el-table__inner-wrapper {
    height: 100%!important;
}
.incomeTalbe .el-table__body-wrapper {
    height: calc(100% - 40px)!important;
    box-sizing: border-box;
}
.el-table--border .el-table__inner-wrapper::after, .el-table--border::after, .el-table--border::before, .el-table__inner-wrapper::before {
    display: none;
}
</style>
