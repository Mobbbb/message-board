import axios, { prefixApi } from '@/libs/api.request'

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
