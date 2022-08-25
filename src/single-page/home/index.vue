<template>
    <div class="list-wrap">
        <div class="article-item-wrap mobile-wrap" v-for="(item, index) in listData" :key="item.id" 
            @click="clickHandle(item, index)">
            <div class="article-title">
                <span class="html-content" v-html="item.htmlContent" :ref="setItemRef"></span>
                <div class="time-text">{{item.pubtime}}</div>
                <!-- <div class="number-text">{{index + 1}}</div> -->
            </div>
            <el-avatar v-if="item.uin === 491450147" class="list-uid" 
                src="/resource/home-assets/images/manifest-36x36.png"/>
            <el-avatar v-else class="list-uid"
                src="/resource/home-assets/images/jhh-avator.jpg"/>
        </div>
        <el-dialog v-model="centerDialogVisible" title="Forbidden" width="275px" center>
            <el-input v-model="password" @keydown.enter="confirm" placeholder="password" />
            <template #footer>
            <span class="dialog-footer">
                <el-button @click="centerDialogVisible = false">Cancel</el-button>
                <el-button type="primary" @click="confirm">Confirm</el-button>
            </span>
            </template>
        </el-dialog>
        <el-empty description="暂无数据" v-if="!listData.length"></el-empty>
    </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'

export default {
    name: 'home',
    setup() {
        const router = useRouter()
        const store = new useStore()
        const password = ref('')
        const clickItem = ref({})
        const htmlContent = ref([])
        const centerDialogVisible = ref(false)
        const listData = computed(() => store.state.app.listData.filter(item => !item.hideDefault))
        const fetchInsertLogHandle = (value) => store.dispatch('app/fetchInsertLogHandle', value)

        onMounted(() => {
            fetchInsertLogHandle(router.currentRoute.value.path)
        })

        const clickHandle = (params) => {
            if (params.realContent) {
                clickItem.value = params
                centerDialogVisible.value = true
            } else {
                navigator.clipboard.writeText(htmlContent.value[params.index].innerText)
                ElMessage({
                    message: '复制成功！',
                    customClass: 'el-message-wrap',
                    type: 'success',
                })
            }
        }

        const confirm = () => {
            if (password.value === clickItem.value.secret) {
                router.push({
                    name: 'detail',
                    query: {
                        id: clickItem.value.id,
                    },
                })
            } else {
                password.value = ''
            }
        }

        const setItemRef = (el) => {
            if (el) {
                htmlContent.value.push(el)
            }
        }

        return {
            htmlContent,
            password,
            centerDialogVisible,
            listData,
            confirm,
            clickHandle,
            setItemRef,
        }
    },
}
</script>

<style scoped>
.list-wrap {
    height: 100%;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
}
.article-item-wrap {
    padding: 12px 12px 8px 12px;
    border-bottom: 1px solid #f0f2f5;
    background: #fff;
    transition: all .15s linear;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
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
    position: relative;
    width: 100%;
    padding-right: 12px;
}
.time-text {
    font-size: 12px;
    color: #999aaa;
    margin-top: 4px;
}
.list-uid {
    width: 38px;
    height: 38px;
    font-size: 12px;
    background: #e6e8ec;
    flex-shrink: 0;
}
.number-text {
    position: absolute;
    right: -50px;
    bottom: -7px;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    line-height: 16px;
    text-align: center;
    border: 1px solid #c2c2c2;
    color: #999aaa;
    transform: scale(0.6, 0.6);
}
</style>

<style>
.html-content img {
    max-width: 100%;
}
.el-dialog__body {
    padding: 0 16px 8px 16px!important;
}
.el-message-wrap {
    min-width: 330px;
}
</style>
