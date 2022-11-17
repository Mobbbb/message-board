<template>
    <div class="main-refresh" :class="activeClass"
        @click="clickItem" @animationend="animationend">
        <div class="svg-wrap">
            <svg><use xlink:href="#widget-roll"></use></svg>
            <svg style="position:absolute;width:0px;height:0px;overflow:hidden;left: 0; top: 0;">
                <!--eslint-disable-next-line-->
                <symbol id="widget-roll" fill="none" viewBox="0 0 12 12"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 6.002C12 3.142 10.205.664 7.683.024a.75.75 0 0 0-.369 1.454C9.15 1.943 10.5 3.807 10.5 6c0 1.8-.908 3.38-2.25 4.144V8.25a.75.75 0 0 0-1.499 0v2.796c0 .045.004.089.013.132a.75.75 0 0 0 .932.798c2.516-.643 4.304-3.118 4.304-5.973ZM4.524.005H4.49a.757.757 0 0 0-.172.022C1.797.658 0 3.14 0 6.004c0 2.86 1.788 5.337 4.304 5.974a.75.75 0 0 0 .367-1.454C2.846 10.062 1.5 8.198 1.5 6.004c0-1.805.91-3.385 2.25-4.147V3.55a.75.75 0 0 0 1.5 0V.745a.75.75 0 0 0-.023-.173l-.01-.04A.654.654 0 0 0 5.155.39.756.756 0 0 0 4.58.01h.001a.665.665 0 0 0-.056-.004Z" fill="currentColor"></path></symbol>
            </svg>
        </div>
        <span>更新列表</span>
        <div v-if="showRedPoint" class="red-point"></div>
    </div>
</template>

<script>
import { ref } from 'vue'

export default {
    name: 'main-refresh',
    props: ['showRedPoint'],
    setup(props, { emit }) {
        const activeClass = ref('')

        const clickItem = () => {
            activeClass.value = 'active'
            emit('on-click')
        }

        const animationend = () => {
            activeClass.value = ''
        }

        return {
            activeClass,
            clickItem,
            animationend,
        }
    },
}
</script>

<style scoped>
.main-refresh {
    position: absolute;
    height: 26px;
    width: 90px;
    bottom: 8px;
    right: 12px;
    z-index: 99;
    background-color: #409eff;
    border: 1px solid #409eff;
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    cursor: pointer;
    box-sizing: border-box;
    border-radius: 4px;
}
.svg-wrap {
    transition: all .5s;
    width: 12px;
    height: 12px;
}
.main-refresh:hover .svg-wrap{
    transform: rotate(360deg);
    transform-origin: 6px 6px;
}
.main-refresh.active .svg-wrap {
    animation: refresh .5s linear 1
}
.main-refresh span {
    display: block;
    font-size: 12px;
    line-height: 12px;
    height: 12px;
}
@keyframes refresh {
    0% {
        transform: rotate(0)
    }
    to {
        transform: rotate(-1turn)
    }
}
.main-refresh svg {
    width: 12px;
    height: 12px;
    color: white;
    display: block;
}
.red-point {
    position: absolute;
    right: -2px;
    top: -2px;
    background: red;
    width: 6px;
    height: 6px;
    border-radius: 50%;
}
</style>
