<template>
    <div class="income-wrap">
        <el-tabs v-model="activeName" @tab-click="handleClick" class="chart-tab">
            <el-tab-pane label="日收益" name="day">
                <div id="incomeChart1"></div>
            </el-tab-pane>
            <el-tab-pane label="累计收益" name="add">
                <div id="incomeChart2"></div>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import { ref, nextTick, onMounted } from 'vue'
import { getOption } from './option'
import { fetchIncomeData } from '@/api'
import { getDateBetween } from '@/libs/util'

export default {
    name: 'income',
    setup() {
        const activeName = ref('day')
        let result1 = []
        let result2 = []

        onMounted(async () => {
            let myChart1 = echarts.init(document.getElementById('incomeChart1'))
            let result = await fetchIncomeData() || []

            result.forEach(item => {
                if (item.name.includes('j')) {
                    result1.push(item)
                }
                if (item.name.includes('y')) {
                    result2.push(item)
                }
            })

            myChart1.setOption(getOption(formatData(result1), formatData(result2)))
        })

        const handleClick = () => {
            nextTick(() => {
                let myChart2 = echarts.init(document.getElementById('incomeChart2'))
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
                myChart2.setOption(getOption(formatData(data1), formatData(data2)))
            })
        }

        const formatData = (data) => {            
            let result = []
            let dateArr = getDateBetween(data[0].date, data[data.length - 1].date)
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
                    result.push({
                        date: item,
                        num: null,
                    })
                }
            })
            
            return result
        }

        return {
            activeName,
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
#incomeChart1, #incomeChart2 {
    width: 100%;
    height: 100%;
}
</style>

<style>
.chart-tab {
    height: 100%;
}
.chart-tab .el-tabs__content {
    height: calc(100% - 55px);
}
.chart-tab .el-tab-pane {
    height: 100%;
}
</style>
