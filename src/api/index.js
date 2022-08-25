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

export const fetchAddEquipment = (params) => {
    return axios.request({
        url: prefixApi + '/equipment/add',
        method: 'post',
        data: params,
    })
}

export const fetchEquipmentList = () => {
    return axios.request({
        url: prefixApi + '/equipment/info',
        method: 'get',
    })
}

export const fetchDeleteEquipment = (id) => {
    return axios.request({
        url: prefixApi + '/equipment/delete',
        method: 'get',
        params: {
            id,
        },
    })
}

export const fetchCharacterInfo = () => {
    return axios.request({
        url: prefixApi + '/character/info',
        method: 'get',
    })
}

export const fetchChangeCharacter = (params) => {
    return axios.request({
        url: prefixApi + '/character/change',
        method: 'post',
        data: params,
    })
}

export const fetchLockEquipment = (params) => {
    return axios.request({
        url: prefixApi + '/character/locked',
        method: 'post',
        data: params,
    })
}

export const fetchJsonData = () => {
    return axios.request({
        url: '/resource/genshin-equipment/json/data.json',
        method: 'get',
    })
}
