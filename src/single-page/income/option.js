import { genVH } from '@/libs/util'

export const getOption = (result1 = [], result2 = [], hideLabel = false) => {
    let dataAll = [...result1.map(item => item.num ? item.num : 0), ...result2.map(item => item.num ? item.num : 0)]
    dataAll.sort((a, b) => b - a)

    const fontSize = genVH(8)

    return {
        legend: {
            show: true,
            top: 30,
        },
        grid: {
            top: 80,
            bottom: '3%',
            left: 0,
            right: '3%',
            containLabel: true,
        },
        tooltip: {
            position: function (point, params, dom, rect, size) {
                if (point[0] < size.viewSize[0] / 2) { // 左侧
                    return [point[0], point[1] - size.contentSize[1] - 50]
                } else {
                    return [point[0] - size.contentSize[0], point[1] - size.contentSize[1] - 50]
                }
            },
        },
        xAxis: {
            data: result1.map(item => item.date.slice(5)),
            axisPointer: {
                show: true,
                type: 'line',
            },
            axisTick: {
                show: false,
            },
            axisLine: {
                lineStyle: {
                    color: '#a2cf94',
                    width: 1,
                    // *$坐标轴负方向延长线
                    shadowOffsetX: -14,
                    shadowColor: '#a2cf94',
                },
            },
            axisLabel: {
                textStyle: {
                    color: '#333',
                    fontSize,
                },
            },
        },
        yAxis: {
            max: parseInt(dataAll[0] * 1.3),
            axisLine: {
                show: false,
            },
            axisTick: {
                show: false,
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: '#f1f3f8',
                },
            },
            axisLabel: {
                show: true,
                // *$修改 axisTick 颜色
                textStyle: {
                    color: (value) => {
                        // *$隐藏0坐标
                        return value !== '0' ? '#333' : 'rgba(0, 0, 0, 0)'
                    },
                    fontSize,
                },
            },
        },
        series: [
            {
                name: '小金',
                type: 'line',
                data: result1.map((item, index) => {
                    if (index === result2.length - 1 || !hideLabel) {
                        return {
                            value: item.num,
                        }
                    }
                    return {
                        value: item.num,
                        symbol: 'none',
                        label: {
                            show: false,
                        },
                    }
                }),
                connectNulls: true,
                smooth: true,
                lineStyle: {
                    color: '#ef97b2',
                },
                itemStyle: {
                    color: '#ef97b2',
                },
                label: {
                    show: true,
                    fontSize,
                },
                areaStyle: {
                    opacity: 0.9,
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: 'rgba(238, 178, 194, 1)'
                        },
                        {
                            offset: 1,
                            color: 'rgba(241, 208, 218, 0.3)'
                        }
                    ])
                },
            },
            {
                name: '小银',
                type: 'line',
                data: result2.map((item, index) => {
                    if (index === result2.length - 1 || !hideLabel) {
                        return {
                            value: item.num,
                        }
                    }
                    return {
                        value: item.num,
                        symbol: 'none',
                        label: {
                            show: false,
                        },
                    }
                }),
                connectNulls: true,
                smooth: true,
                lineStyle: {
                    color: '#8196d5',
                },
                itemStyle: {
                    color: '#8196d5',
                },
                label: {
                    show: true,
                    fontSize,
                },
                areaStyle: {
                    opacity: 0.9,
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: 'rgba(129, 150, 213, 1)'
                        },
                        {
                            offset: 1,
                            color: 'rgba(217, 227, 255, 0.3)'
                        }
                    ])
                },
            }
        ]
    }
}
