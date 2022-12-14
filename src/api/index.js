import axios, { prefixApi } from '@/libs/api.request'

export const fetchUserLogin = (uid, password) => {
    return axios.request({
        url: prefixApi + '/user/login',
        method: 'post',
        data: { uid, password },
    })
}

export const fetchUserInfo = () => {
    return axios.request({
        url: prefixApi + '/user/info',
        method: 'get',
    })
}

export const fetchListData = () => {
    return axios.request({
        url: '/resource/message-board/message.json',
        method: 'get',
    })
}

export const fetchFlag = () => {
    return axios.request({
        url: prefixApi + '/other/selectAllFlag',
        method: 'get',
    })
}

export const fetchInsertLog = (params) => {
    return axios.request({
        url: prefixApi + '/other/insertLog',
        method: 'post',
        data: params,
    })
}

export const fetchIncomeData = () => {
    return axios.request({
        url: '/resource/message-board/income.json',
        method: 'get',
    })
}

export const fetchIncomeInfo = () => {
    return axios.request({
        url: prefixApi + '/other/incomeInfo',
        method: 'get',
    })
}

export const fetchInsertIncome = (params) => {
    return axios.request({
        url: prefixApi + '/other/insertIncome',
        method: 'post',
        data: params,
    })
}

export const fetchDeleteIncome = (id) => {
    return axios.request({
        url: prefixApi + '/other/deleteIncome',
        method: 'get',
        params: { id },
    })
}

export const fetchOrderInfo = (params) => {
    return axios.request({
        url: prefixApi + '/other/orderInfo',
        method: 'post',
        data: params,
    })
}

export const fetchInsertOrder = (params) => {
    return axios.request({
        url: prefixApi + '/other/insertOrder',
        method: 'post',
        data: params,
    })
}

export const fetchDeleteOrder = (id) => {
    return axios.request({
        url: prefixApi + '/other/deleteOrder',
        method: 'get',
        params: { id },
    })
}

export const fetchFutureConfigInfo = () => {
    return axios.request({
        url: prefixApi + '/other/futureConfigInfo',
        method: 'get',
    })
}

export const fetchOpeningOrderInfo = () => {
    return axios.request({
        url: prefixApi + '/other/openingOrderInfo',
        method: 'get',
    })
}
