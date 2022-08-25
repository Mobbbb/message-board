<template>
    <el-tooltip :effect="effect" :placement="placement">
        <template #content>
            <slot></slot>
        </template>
        <el-icon class="pop-tips-icon" :style="iconStyle"><question-filled /></el-icon>
    </el-tooltip>
</template>

<script>
import { computed } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'

export default {
    name: 'question-tips',
    components: {
        QuestionFilled,
    },
    props: {
        gap: {
            type: Array,
            default: () => {
                return [0, 0]
            },
        },
        placement: {
            type: String,
            default: 'left',
        },
        effect: {
            type: String,
            default: 'light',
        },
        style: {
            type: Object,
            default: () => {
                return {}
            },
        },
    },
    setup(props) {
        const iconStyle = computed(() => {
            return {
                marginLeft: `${props.gap[0]}px`,
                marginRight: `${props.gap[1]}px`,
                ...props.style,
            }
        })

        return {
            iconStyle,
        }
    },
}
</script>

<style scoped>
.pop-tips-icon {
    color: #bbb9b9;
    cursor: pointer;
}
</style>
