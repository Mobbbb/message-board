<template>
    <div class="app-main" :class="appMainClass" :style="appMainStyle" @click="handleSelect" @touchmove.self.prevent>
        <NavMenu @on-search="searchHandle"></NavMenu>
        <div class="main-wrap" :style="mainWrapStyle" v-loading="isLoading">
            <router-view></router-view>
            <Refresh @on-click="refreshHandle" :showRedPoint="showRedPoint" 
                v-show="router.currentRoute.value.name !== 'income'"></Refresh>
        </div>
    </div>
</template>

<script>
import NavMenu from '@/single-page/components/nav-menu.vue'
import Refresh from '@/single-page/components/refresh.vue'
import config, { PC } from '@/config'
import { filterDataByText } from '@/libs/data-processing'
import { fetchListData, fetchFlag } from '@/api'
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

window.version = require('package').version

export default {
    name: 'App',
    components: {
        NavMenu,
        Refresh,
    },
    setup() {
        const router = useRouter()
        const store = new useStore()
        const isLoading = ref(false)
        const showRedPoint = ref(false)
        const newStatus = ref(null)
        const originData = computed(() => store.state.app.originData)

        const setOriginData = (value) => store.commit('app/setOriginData', value)
        const setListData = (value) => store.commit('app/setListData', value)
        
        onMounted(async () => {
            window.addEventListener('load', function() {
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.register('/sw.js')
                }
            })
            
            let clearStatus = localStorage.getItem(`clear-status`)
            if (!clearStatus) {
                localStorage.clear()
                localStorage.setItem(`clear-status`, 1)
            }
            let localData = localStorage.getItem(`message-list`)
            localData = JSON.parse(localData) || {}
            if (localData[window.version]) {
                setOriginData(localData[window.version])
                setListData(localData[window.version])
                showRedPoint.value = await requestFlag(false)
            } else {
                showRedPoint.value = await requestFlag()
                requestHandle()
            }
        })

        const requestFlag = async (loading) => {
            if (loading) isLoading.value = true
            const { data = [] } = await fetchFlag() || {}
            if (loading) isLoading.value = false
            const { message_status: msgStatus } = data[0] || {}
            const localStatus = localStorage.getItem('message-status')

            newStatus.value = msgStatus
            if (localStatus) {
                return localStatus < msgStatus
            } else {
                localStorage.setItem('message-status', msgStatus)
                return false
            }
        }

        const requestHandle = async () => {
            isLoading.value = true
            let result = await fetchListData() || []
            result.sort((a, b) => b.id - a.id)
            result.forEach((item, index) => {
                item.index = index
                if (item.htmlContent.indexOf('qzone/em') > -1) {
                    const splitStr = item.htmlContent.split('<img src="')
                    item.htmlContent = splitStr.join('<img src="//qzonestyle.gtimg.cn')
                }
                if (item.htmlContent.indexOf('&nbsp;<br  />') > -1) {
                    item.htmlContent = item.htmlContent.replace('&nbsp;<br  />', '<br  />')
                }
                if (item.htmlContent.indexOf('<br  />&nbsp;') > -1) {
                    item.htmlContent = item.htmlContent.replace('<br  />&nbsp;', '<br  />')
                }
            })
            isLoading.value = false
            showRedPoint.value = false
            localStorage.setItem('message-status', newStatus.value)

            setOriginData(JSON.parse(JSON.stringify(result)))
            setListData(result)
            if (result instanceof Array && result.length) {
                let obj = {}
                obj[window.version] = result
                localStorage.setItem('message-list', JSON.stringify(obj))
            }
        }

        const refreshHandle = async () => {
            await requestHandle()
            localStorage.setItem('message-status', newStatus.value)
            showRedPoint.value = false
        }

        const searchHandle = (value) => {
            setListData(filterDataByText(value, originData.value))
        }

        return {
            router,
            mainWrapStyle: computed(() => store.getters['app/mainStyle']),
            appMainClass: computed(() => config.device === PC ? '' : 'mobile-class'),
            appMainStyle: computed(() => {
                return {
                    paddingTop: `${store.state.app.navHeight}px`,
                    background: '#f5f5f5',
                }
            }),
            isLoading,
            showRedPoint,
            searchHandle,
            requestHandle,
            refreshHandle,
        }
    },
}
</script>

<style scoped>
.app-main{
    background-size: 100% auto;
    background-repeat: no-repeat;
    box-sizing: border-box;
    height: 100%;
    width: 100%;
}
.main-wrap{
    margin: 0 auto;
    box-sizing: border-box;
    background: #fff;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
    border-radius: 2px;
    position: relative;
}
.list-wrap {
    height: 100%;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
}
.article-item-wrap {
    padding: 16px 12px 12px 12px;
    border-bottom: 1px solid #f0f2f5;
    background: #fff;
    transition: all .15s linear;
}
.article-item-wrap:nth-of-type(2n + 1) {
    background: #f9fafc;
    cursor: pointer;
}
.article-item-wrap:hover {
    background: #f9fafc;
    cursor: pointer;
}
.article-item-wrap:hover .article-title {
    color: #fc5531;
}
.article-title {
    word-break: break-all;
    color: #555666;
    font-size: 14px;
    font-weight: 500;
    transition: all .15s linear;
}
.article-type-wrap {
    display: flex;
    align-items: center;
}
.article-type-label {
    color: #fc5531;
    background-color: #fff5f2;
    padding: 2px 8px;
    font-size: 12px;
    border-radius: 2px;
    display: inline-block;
    white-space: nowrap;
}
.ellipsis-content {
    margin-top: 6px;
    line-height: 22px;
    white-space: normal;
    color: #999aaa;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}
.article-info-wrap {
    color: #5f6471;
    margin-top: 2px;
    height: 24px;
    line-height: 24px;
}
</style>
