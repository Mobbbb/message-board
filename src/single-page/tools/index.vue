<template>
    <div class="list-wrap">
        <div class="search-input-wrap">
            <el-input v-model="inputText" 
                @keydown.enter="searchHandle" 
                @clear="searchHandle"
                clearable
                placeholder="请输入..."
                class="search-input" />
            <el-button size="small" type="primary" style="height: 28px;border-radius: 0 3px 3px 0;" @click="searchHandle">MD5加密</el-button>
        </div>
        <el-input class="tool-textarea" type="textarea" resize="none" v-model="md5Result" />
    </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import md5 from '@/libs/md5'

export default {
    name: 'home',
    setup() {
        const store = new useStore()
        const inputText = ref('')
        const md5Result = ref('')
        
        const fetchInsertLogHandle = (value) => store.dispatch('app/fetchInsertLogHandle', value)

        onMounted(() => {
            fetchInsertLogHandle()
        })

        const searchHandle = () => {
            md5Result.value = md5(inputText.value)
        }

        return {
            md5Result,
            inputText,
            searchHandle,
        }
    },
}
</script>

<style scoped>
.list-wrap {
    padding: 12px 12px 8px 12px;
}
.search-input-wrap {
    display: flex;
    width: 195px;
    height: 32px;
    line-height: 28px;
    right: 16px;
    top: 16px;
}
</style>

<style>
.tool-textarea > textarea{
    border: 1px solid #dcdfe6;
    box-shadow: none;
    transition: border .2s cubic-bezier(0.645, 0.045, 0.355, 1);
    padding-left: 8px;
    padding-right: 8px;
    font-size: 14px;
}
.tool-textarea > .el-textarea__inner:hover {
    box-shadow: none;
    border: 1px solid #c0c4cc;
}
.tool-textarea > .el-textarea__inner:focus {
    box-shadow: none;
    border: 1px solid #409eff;
}
.search-input-wrap .el-input__inner {
    height: 28px;
    border-radius: 4px 0 0 4px;
}
.search-input-wrap .el-input__suffix {
    height: 28px;
}
</style>
