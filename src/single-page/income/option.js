export const getOption = (result1, result2) => {
    // let dataAll = [...result1.map(item => item.num ? item.num : 0), ...result2.map(item => item.num ? item.num : 0)]
    // dataAll.sort((a, b) => b - a)

    return {
        legend: {
            show: true,
            top: 0,
        },
        grid: {
            top: '8%',
            bottom: '3%',
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
            // max: parseInt(dataAll[0] * 1.2),
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
            {
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
            {
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
