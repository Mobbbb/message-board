<template>
    <div class="detail-wrap mobile-wrap">
        <div class="info-wrap">
            <div class="title-text">{{params.ubbContent}}</div>
            <div class="back-btn" @click="backHandle">返回</div>
        </div>
        <div class="text-indent" v-for="(item, index) in params.realContent" :key="index">{{item}}</div>
    </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { useStore } from 'vuex'

export default {
    name: 'detail',
    setup() {
        const router = useRouter()
        const store = new useStore()
        const listData = computed(() => store.state.app.listData)

        const params = computed(() => {
            return listData.value.filter(item => item.id === router.currentRoute.value.query.id)[0] || {}
        })
    
        const backHandle = () => {
            history.back()
        }

        return {
            params,
            backHandle,
        }
    },
}
</script>

<style scoped>
.detail-wrap {
    height: 100%;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: 12px 24px;
    font-size: 14px;
    line-height: 1.6;
    color: #404040;
    box-sizing: border-box;
}
.info-wrap {
    color: #999aaa;
    background: #f8f8f8;
    border-radius: 4px;
    margin-bottom: 12px;
    padding: 4px 12px;
    position: relative;
}
.title-text {
    font-size: 28px;
    font-weight: 700;
    color: #404040;
}
.back-btn {
    color: #8fb0c9;
    padding: 0 4px;
    font-size: 12px;
    line-height: 32px;
    position: absolute;
    right: 8px;
    top: 4px;
    cursor: pointer;
    z-index: 11;
}
.back-btn:hover {
    color: #fc5531;
}
.text-indent {
    margin-top: 4px;
    text-indent: 24px;
}
</style>
