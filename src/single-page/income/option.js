import { genVH } from '@/libs/util'

const lineColorArr = ['#ef97b2', '#8196d5', '#7dcf15']

const areaColorArr = [
    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        {
            offset: 0,
            color: 'rgba(238, 178, 194, 1)'
        },
        {
            offset: 1,
            color: 'rgba(241, 208, 218, 0.3)'
        }
    ]),
    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        {
            offset: 0,
            color: 'rgba(129, 150, 213, 1)'
        },
        {
            offset: 1,
            color: 'rgba(217, 227, 255, 0.3)'
        }
    ]),
    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        {
            offset: 0,
            color: 'rgba(169, 213, 151, 1)'
        },
        {
            offset: 1,
            color: 'rgba(225, 255, 212, 0.3)'
        }
    ]),
]

const fontSize = genVH(8)

/**
 * 
 * @param {*} dim [{ data: [], name: '' }]
 * @param {*} onlyShowLast 
 * @returns 
 */
export const getOption = (dim = [], onlyShowLast = false) => {
    let dataAll = []
    dim.forEach(item => {
        dataAll = dataAll.concat(item.data)
    })
    dataAll = [...dataAll.map(item => item.num ? item.num : 0)]
    dataAll.sort((a, b) => b - a)

    const series = []

    dim.forEach((item, index) => {
        series.push({
            name: item.name,
            type: 'line',
            data: item.data.map((cell, index) => {
                return formatLabel(item.data, cell, index, onlyShowLast)
            }),
            showAllSymbol: true,
            connectNulls: true,
            smooth: true,
            animationDuration: 500,
            lineStyle: {
                color: lineColorArr[index],
            },
            itemStyle: {
                color: lineColorArr[index],
            },
            label: {
                show: true,
                fontSize,
            },
            areaStyle: {
                opacity: 0.9,
                color: areaColorArr[index]
            },
        })
    })

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
                if (point[0] < size.viewSize[0] / 2) { // ??????
                    return [point[0], point[1] - size.contentSize[1] - 50]
                } else {
                    return [point[0] - size.contentSize[0], point[1] - size.contentSize[1] - 50]
                }
            },
        },
        xAxis: {
            data: dim[0] && dim[0].data.map(item => item.date) || [],
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
                    // *$???????????????????????????
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
                // *$?????? axisTick ??????
                textStyle: {
                    color: (value) => {
                        // *$??????0??????
                        return value !== '0' ? '#333' : 'rgba(0, 0, 0, 0)'
                    },
                    fontSize,
                },
            },
        },
        series,
    }
}

const formatLabel = (data, item, index, onlyShowLast) => {
    if (onlyShowLast) {
        if (index === data.length - 1) {
            return {
                value: item.num,
            }
        } else {
            return {
                value: item.num,
                symbol: 'none',
                label: {
                    show: false,
                },
            }
        }
    }
    
    if (item.num === 0) {
        return {
            value: item.num,
            symbol: 'none',
            label: {
                show: false,
            },
        }
    }
    return {
        value: item.num,
    }
}
