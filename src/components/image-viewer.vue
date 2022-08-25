<template>
    <div class="image-viewer-wrapper" v-if="modelValue">
        <div class="image-viewer-mask" @click="clickMask"></div>
        <div class="image-weapper" @click="clickMask">
            <img :src="img" @click.stop>
        </div>
    </div>
</template>

<script>
export default {
    name: 'image-viewer',
    props: {
        img: {
            type: String,
            default: '',
        },
        modelValue: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const clickMask = () => {
            emit('update:modelValue', false)
        }

        return {
            clickMask,
        }
    },
}
</script>

<style scoped>
.image-viewer-wrapper {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 100;
}
.image-viewer-mask {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    opacity: .5;
    background: #000;
}
.image-weapper {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
}
.image-weapper img {
    max-height: 100%;
    max-width: 100%;
    transform: scale(1) rotate(0deg) translate(0px, 0px);
    transition: transform 0.3s ease 0s;
}
</style>
