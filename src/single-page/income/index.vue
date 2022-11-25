<template>
    <div class="income-wrap">
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
                        <el-table-column prop="date" label="日期" :width="dateWidth" />
                        <el-table-column prop="num" label="收益" :width="numWidth" />
                        <el-table-column prop="showName" label="角色" :width="nameWidth" />
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
                    <div class="table-input-wrap" :style="{ width: `${wrapWidth}px` }">
                        <div :style="{ width: `${dateWidth}px`, height: '32px' }">
                            <el-date-picker v-model="date" type="date" placeholder="日期" :editable="false" :clearable="false" style="width: 80px;" />
                        </div>
                        <div :style="{ width: `${numWidth}px`, height: '32px' }">
                            <el-input-number v-model="num" class="table-input-number" :controls="false" style="width: 50px;" />
                        </div>
                        <div :style="{ width: `${nameWidth}px`, height: '32px' }">
                            <el-select v-model="name" multiple placeholder="角色" style="width: 120px;">
                                <el-option label="金" value="j"></el-option>
                                <el-option label="银" value="y"></el-option>
                                <el-option label="其他" value="other"></el-option>
                            </el-select>
                        </div>
                        <div style="width: 60px;flex-shrink: 0;"></div>
                        <div class="custom-opt">
                            <el-button type="primary" size="small" @click="submitHandle">录入</el-button>
                        </div>
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
        const name = ref(['j', 'y'])

        const festivalList = ['2022-09-10', '2022-09-11', '2022-09-12', '2022-10-01', '2022-10-02', '2022-10-03', 
            '2022-10-04', '2022-10-05', '2022-10-06', '2022-10-07']

        let dateWidth = ref(90)
        let numWidth = ref(62)
        let nameWidth = ref(120)
        let wrapWidth = ref(0)

        let result1 = []
        let result2 = []
        let result3 = []

        let myChart1 = null
        let myChart2 = null

        const overMediaCritical = computed(() => store.getters['app/overMediaCritical'])
        const activeName = computed({
            get() {
                return store.state.app.activeTabName
            },
            set(value) {
                setActiveTabName(value)
            },
        })
        const setActiveTabName = (value) => store.commit('app/setActiveTabName', value)
        const fetchInsertLogHandle = (value) => store.dispatch('app/fetchInsertLogHandle', value)

        onMounted(async () => {
            let chartTabWidth = parseInt(document.getElementsByClassName('chart-tab')[0].getBoundingClientRect().width)
            dateWidth.value = parseInt((chartTabWidth - 60) * 90 / (90 + 62 + 120))
            numWidth.value = parseInt((chartTabWidth - 60) * 62 / (90 + 62 + 120))
            nameWidth.value = parseInt((chartTabWidth - 60) * 120 / (90 + 62 + 120))
            wrapWidth.value = dateWidth.value + numWidth.value + nameWidth.value + 60

            fetchInsertLogHandle()
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
            setRes()

            nextTick(() => {
                document.getElementById('incomeChart1').removeAttribute('_echarts_instance_')
                myChart1 = echarts.init(document.getElementById('incomeChart1'))
                myChart1.setOption(getOption(result1, result2, result3))
            })
        }

        const getTotalIncome = () => {
            setRes()

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

        const setRes = () => {
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
            let dateArr = getDateBetween(data[data.length - 1].date, data[0].date)

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
            res.data.sort((a, b) => Date.parse(new Date(b.date)) - Date.parse(new Date(a.date)))
            res.data.forEach(item => {
                if (!Array.isArray(item.name)) {
                    item.name = item.name.split(',')
                }
                const nameArr = []
                item.name.forEach(cell => {
                    nameArr.push(nameMap[cell])
                })
                item.showName = nameArr.join('、')
            })
                
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
            name.value = ['j', 'y']
            getTableData()
            num.value = 0
        }

        const deleteRow = async (data) => {
            await fetchDeleteIncome(data.row.id)
            getTableData()
        }

        return {
            numWidth,
            dateWidth,
            nameWidth,
            wrapWidth,
            overMediaCritical,
            tableData,
            activeName,
            date,
            num,
            name,
            submitHandle,
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
    padding-left: 12px;
}
#incomeChart1, #incomeChart2, .incomeTalbe {
    width: 100%;
    height: 100%;
    background: white;
}
.incomeTalbe {
    font-size: 12px;
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
    align-items: center;
    top: 40px;
    z-index: 10;
    height: 48px;
    width: 100%;
    border-bottom: 1px solid #ebeef5;
    box-sizing: border-box;
}
</style>

<style>
.chart-tab {
    height: 100%;
}
.chart-tab .el-tabs__content {
    height: calc(100% - 42px)!important;
}
.chart-tab .el-tabs__header {
    padding-right: 12px;
    margin-bottom: 1px;
}
.chart-tab .el-tab-pane {
    height: 100%!important;
}
.el-input--suffix .el-input__inner {
    padding-right: 2px!important;
    padding-left: 4px!important;
}
.el-tag--default .el-tag__close {
    margin-left: 0!important;
}
.el-tag--default {
    padding: 4px!important;
}
.incomeTalbe .el-table__body-wrapper {
    padding-top: 48px!important;
}
.el-table .cell {
    padding: 0 6px!important;
}
.el-table-fixed-column--right .cell {
    padding-left: 0!important;
    padding-right: 0!important;
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
.incomeTalbe .el-table--border .el-table__inner-wrapper::after, 
.incomeTalbe .el-table--border::after, 
.incomeTalbe .el-table--border::before, 
.incomeTalbe .el-table__inner-wrapper::before {
    display: none;
}
.table-input-number.is-without-controls .el-input .el-input__inner {
    padding-left: 4px;
    padding-right: 4px;
}
.custom-opt {
    width: 60px;
    height: 48px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    z-index: 10;
    right: 0;
    background: white;
    border-bottom: 1px solid #ebeef5;
    box-sizing: border-box;
}
.custom-opt::before {
    left: -10px;
    content: "";
    position: absolute;
    top: 0;
    width: 10px;
    bottom: -1px;
    overflow-x: hidden;
    overflow-y: hidden;
    box-shadow: inset -10px 0 10px -10px rgb(0 0 0 / 15%);
    touch-action: none;
    pointer-events: none;
}
.table-input-wrap .el-select__tags > span {
    margin-left: 6px!important;
}
</style>
