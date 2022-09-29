<template>
    <div class="nav-wrap">
        <div class="page-nav-wrap" :style="pageNavWrapStyle">
            <el-menu    background-color="transparent" 
                        class="el-menu-nav" 
                        mode="horizontal" 
                        :default-active="activeNavIndex" 
                        router>
                <template v-for="item in routes">
                    <el-menu-item :index="item.path" v-if="item.meta.level === 0" :key="item.path">
                        {{item.meta.name}}
                    </el-menu-item>
                </template>
            </el-menu>

            <div class="search-input-wrap">
                <el-input v-model="searchText" 
                    @keydown.enter="searchHandle" 
                    @clear="searchHandle"
                    clearable
                    placeholder="请输入..."
                    class="search-input" />
                <el-button size="small" type="primary" style="height: 28px;border-radius: 0 3px 3px 0;" @click="searchHandle">搜索</el-button>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState} from 'vuex'
import { routes } from '@/router'

export default {
    name: 'nav-menu',
    data() {
        return {
            searchText: '',
            routes,
        }
    },
    computed: {
        ...mapState('app', [
            'mainWidth',
            'navHeight',
            'activeNavIndex',
        ]),
        pageNavWrapStyle() {
            return {
                width: `${this.mainWidth.width * 100}%`,
                height: `${this.navHeight}px`,
            }
        },
    },
    methods: {
        searchHandle() {
            this.$emit('on-search', this.searchText)
        },
    },
}
</script>

<style scoped>
.nav-wrap {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    z-index: 100;
    background: white;
    box-sizing: border-box;
    box-shadow: 0 2px 8px 1px rgba(100, 100, 100, 0.1);
}
.page-nav-wrap {
    position: relative;
    overflow: hidden;
    margin: 0 auto;
}
.user-wrap {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    z-index: 1;
    padding-right: 12px;
    display: flex;
    align-items: center;
}
.avatar-icon {
    display: block;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 1px solid #e7e7e7;
    cursor: pointer;
}
.login-btn {
    height: 24px;
    width: 24px;
    line-height: 22px;
    border-radius: 50%;
    color: #fb7299;
    font-size: 12px;
    background: #e7e7e7;
    transform: scale(0.8);
    padding: 4px;
    margin-right: -2px;
    white-space: nowrap;
}
.search-input-wrap {
    position: absolute;
    display: flex;
    width: 185px;
    height: 32px;
    line-height: 28px;
    right: 16px;
    top: 14px;
}
</style>

<style>
.el-menu-nav {
    border-bottom: none!important;
}
.el-menu-nav > .is-active{
    border-color: #a5d1ff!important;
    background-color: transparent!important;
}
.el-menu-nav > .el-menu-item:hover{
    background-color: transparent!important;
}
.search-input-wrap .el-input__inner {
    height: 28px;
    border-radius: 4px 0 0 4px;
}
.search-input-wrap .el-input__suffix {
    height: 28px;
}
</style>
