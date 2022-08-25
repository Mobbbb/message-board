<template>
    <div class="gc-radio" :class="btnClass" @click="clickHandle">
        <span class="gc-radio-inner"><slot></slot></span>
    </div>
</template>

<script>
import { computed, toRefs } from 'vue'

export default {
    name: 'gc-radio',
    props: {
        modelValue: {},
        disabled: {
            type: Boolean,
            default: false,
        },
        label: {
            type: String,
            default: '',
        },
        unCheckLabel: {
            type: String,
            default: '',
        },
    },
    setup(props, { emit }) {
        const { disabled, modelValue, label, unCheckLabel } = toRefs(props)

        const selected = computed(() => {
            if (label.value) {
                return label.value === modelValue.value
            } else if (typeof modelValue.value === 'boolean') {
                return modelValue.value
            }
            return false
        })

        const btnClass = computed(() => {
            let _class = disabled.value ? 'gc-radio-disabled' : ''

            if (selected.value) _class += ' gc-radio-selected'

            return _class
        })

        const clickHandle = () => {
            if (!disabled.value) {
                if (label.value) {
                    if (label.value === modelValue.value) {
                        emit('update:modelValue', unCheckLabel.value)
                    } else {
                        emit('update:modelValue', label.value)
                    }
                } else if (typeof modelValue.value === 'boolean') {
                    emit('update:modelValue', !modelValue.value)
                }
            }
        }

        return {
            btnClass,
            clickHandle,
        }
    },
}
</script>

<style scoped>
.gc-radio {
    display: inline-block;
}
.gc-radio-inner {
    display: inline-block;
    white-space: normal;
    line-height: 1;
    cursor: pointer;
    text-align: center;
    box-sizing: border-box;
    font-size: 12px;
    padding: 7px 8px;
    color: #606266;
    background-color: white;
    border: 1px solid #dcdfe6;
    border-left: none;
    border-radius: 0 4px 4px 0;
    transition: all .3s cubic-bezier(0.645, 0.045, 0.355, 1);
}
.gc-radio-selected .gc-radio-inner {
    color: white;
    background-color: #409eff;
    border-color: #409eff;
}
.gc-radio-disabled .gc-radio-inner {
    color: #a8abb2;
    background-color: white;
    border-color: #e4e7ed;
    cursor: not-allowed;
}
.gc-radio-disabled.gc-radio-selected .gc-radio-inner {
    color: white;
    background-color: #a0cfff;
    border-color: #a0cfff;
    cursor: not-allowed;
}
</style>
