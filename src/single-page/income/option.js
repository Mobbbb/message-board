export const getOption = (result1, result2, title) => {
    return {
        legend: {
            show: true,
            top: 0,
        },
        grid: {
            top: '8%',
            bottom: 0,
            left: 0,
            right: 0,
            containLabel: true,
        },
        tooltip: {},
        xAxis: {
            data: result1.map(item => item.date.slice(5)),
            axisPointer: {
                show: true,
                type: 'line',
            },
            axisTick: {
                show: false,
            },
        },
        yAxis: {
            axisLine: {
                show: true,
            },
            axisTick: {
                show: false,
            },
            splitLine: {
                show: true,
            },
        },
        series: [
            { // j
                name: '小金',
                type: 'line',
                data: result1.map(item => item.num),
                connectNulls: true,
                smooth: true,
                symbolSize: 2,
                lineStyle: {
                    color: '#427bde',
                },
            },
            { // y
                name: '小银',
                type: 'line',
                data: result2.map(item => item.num),
                connectNulls: true,
                smooth: true,
                symbolSize: 2,
                lineStyle: {
                    color: '#7dcf15',
                },
            }
        ]
    }
}
