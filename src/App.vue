<template>
    <div class="app-main" :class="appMainClass" :style="appMainStyle" @click="handleSelect" @touchmove.self.prevent>
        <NavMenu @on-search="searchHandle"></NavMenu>
        <div class="main-wrap" :style="mainWrapStyle">
            <router-view></router-view>
        </div>
    </div>
</template>

<script>
import NavMenu from '@/single-page/components/nav-menu.vue'
import Refresh from '@/single-page/components/refresh.vue'
import config, { PC } from '@/config'
import { filterDataByText } from '@/libs/data-processing'
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'

window.version = require('package').version

export default {
    name: 'App',
    components: {
        NavMenu,
        Refresh,
    },
    setup() {
        const store = new useStore()
        const originData = computed(() => store.state.app.originData)

        const setListData = (value) => store.commit('app/setListData', value)
        const INIT_USER = (value) => store.dispatch('app/INIT_USER', value)
        
        onMounted(async () => {
            INIT_USER()
            window.addEventListener('load', function() {
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.register('/sw.js')
                }
            })
        })

        const searchHandle = (value) => {
            setListData(filterDataByText(value, originData.value))
        }

        return {
            mainWrapStyle: computed(() => store.getters['app/mainStyle']),
            appMainClass: computed(() => config.device === PC ? '' : 'mobile-class'),
            appMainStyle: computed(() => {
                return {
                    paddingTop: `${store.state.app.navHeight}px`,
                    background: '#f5f5f5',
                }
            }),
            searchHandle,
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
