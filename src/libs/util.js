/**
 * @description 数组或对象的深度克隆
 * @param {*} obj
 * @returns {*} 返回新的克隆数组或对象
 */
export const deepClone = function (obj) {
    const newObj = Array.isArray(obj) ? [] : {}

    if (obj && typeof obj === 'object') {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                newObj[key] = (obj && typeof obj[key] === 'object') ? deepClone(obj[key]) : obj[key]
            }
        }
    }
    return newObj
}

/**
 * @description 降序 3,2,1
 * @param {String} key
 * @returns
 */
export const descendingOrder = (key = '') => {
    return function (a, b) {
        if (key) {
            return b[key] - a[key]
        } else {
            return b - a
        }
    }
}

/**
 * @description 升序 1,2,3
 * @param {String} key
 * @returns
 */
export const ascendingOrder = (key = '') => {
    return function (a, b) {
        if (key) {
            return a[key] - b[key]
        } else {
            return a - b
        }
    }
}

// cdn - https://code.jquery.com/jquery-3.6.0.min.js
export async function getMsgBoard() {
    let arr = []
    let start = 0
    let request = (start) => {
        return new Promise((resolve) => {
            $.ajax({
                url: `//user.qzone.qq.com/proxy/domain/m.qzone.qq.com/cgi-bin/new/get_msgb?uin=491450147&hostUin=737436264&start=${start}&s=0.20934140455035966&format=jsonp&num=10&inCharset=utf-8&outCharset=utf-8&g_tk=440174541&g_tk=440174541`,
                dataType: 'jsonp',
                success: function (response) {
                    let data = response.data || {}
                    let commentList = data.commentList || []
                    resolve(commentList)
                },
                jsonpCallback: '_Callback',
            })
        })
    }

    let wait = () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve()
            }, 500)
        })
    }

    let dg = async () => {
        let result = await request(start)
        arr = arr.concat(result)
        start += 10
        console.log(arr)
        if (arr.length < 1166) {
            await wait()
            await dg()
        }
    }

    await dg()

    return arr
}

export function getQueryVariable(variable) {
    let query = window.location.search.substring(1)
    let vars = query.split("&")
    for (let i = 0; i < vars.length; i++) {
        let pair = vars[i].split("=")
        if (pair[0] == variable) {
            return pair[1]
        }
    }
    return null
}

export function getCurrentTime() {
    var date = new Date() // 当前时间
    var year = date.getFullYear() // 年
    var month = repair(date.getMonth() + 1) // 月
    var day = repair(date.getDate()) // 日
    var hour = repair(date.getHours()) // 时
    var minute = repair(date.getMinutes()) // 分
    var second = repair(date.getSeconds()) // 秒

    // 当前时间 
    var curTime = year + "-" + month + "-" + day
        + " " + hour + ":" + minute + ":" + second;
    return curTime
}

// 若是小于10就加个0
function repair(i) {
    if (i >= 0 && i <= 9) {
        return "0" + i;
    } else {
        return i;
    }
}

export function getDateBetween(startTime, endTime) {

    let dateArr = [];
    let i = 0;

    while (startTime <= endTime) {
        dateArr[i] = startTime;

        let timestamp = new Date(startTime).getTime();
        let nDate = timestamp + (24 * 60 * 60 * 1000);

        let Y = new Date(nDate).getFullYear() + '-';
        let m = (new Date(nDate).getMonth() + 1 < 10) ? '0' + (new Date(nDate).getMonth() + 1) + '-' : (new Date(nDate).getMonth() + 1) + '-';
        let d = (new Date(nDate).getDate() < 10) ? '0' + new Date(nDate).getDate() : new Date(nDate).getDate();

        startTime = Y + m + d;
        i++;
    }

    return dateArr;
}
