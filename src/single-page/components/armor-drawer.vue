<template>
    <div class="armor-drawer">
        <div class="avatar-wrap" @click="showPanelStatus = true">
            <template v-if="currentArmor.image">
                <img class="avatar-image" :src="currentArmor.image">
                <div class="avatar-name"><span>{{currentArmor.name}}</span></div>
            </template>
            <template v-else>
                <div class="empty-block">
                    <el-icon class="select-icon"><goods /></el-icon>
                    <span>请选择圣遗物</span>
                </div>
            </template>
        </div>
        <el-drawer v-model="showPanelStatus" direction="ltr" :size="drawerWidth">
            <template #default>
                <div class="avatar-item-wrap">
                    <div class="avatar-item"
                        @click="selectArmorHandle(item)"
                        v-for="item in COORDINATES"
                        :key="item">
                        <img class="avatar-image" :src="item.image">
                        <div class="avatar-name"><span>{{item.name}}</span></div>
                    </div>
                </div>
            </template>
        </el-drawer>
    </div>
</template>

<script>
import { computed, ref, toRefs } from 'vue'
import { useStore } from 'vuex'
import { Goods } from '@element-plus/icons-vue'

export default {
    name: 'armor-drawer',
    components: {
        Goods,
    },
    props: ['modelValue'],
    setup(props, { emit }) {
        const { modelValue } = toRefs(props)
        const showPanelStatus = ref(false)

        const store = new useStore()
        const COORDINATES_OBJ = computed(() => store.state.app.COORDINATES_OBJ)
        const overMediaCritical = computed(() => store.getters['app/overMediaCritical'])

        const selectArmorHandle = (value) => {
            emit('update:modelValue', value.value)
            showPanelStatus.value = false
        }

        const drawerWidth = computed(() => overMediaCritical.value ? 230 : 379)

        const currentArmor = computed(() => {
            if (modelValue.value) {
                return COORDINATES_OBJ.value[modelValue.value]
            }
            return {}
        })

        return {
            COORDINATES: computed(() => store.state.app.COORDINATES),
            COORDINATES_OBJ,

            currentArmor,
            drawerWidth,
            showPanelStatus,
            selectArmorHandle,
        }
    },
}
</script>

<style scoped>
.armor-drawer {
    width: 60px;
    margin-right: 12px;
    border-radius: 4px;
    overflow: hidden;
}
.avatar-wrap {
    flex-shrink: 0;
    color: #333333;
    cursor: pointer;
}
.avatar-image, .empty-block {
    width: 60px;
    height: 60px;
    display: block;
}
.empty-block {
    height: 92px;
    color: #c0c4cc;
    box-sizing: border-box;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all .2s;
}
.select-icon {
    font-size: 22px;
    transition: all .2s;
}
.empty-block span {
    font-size: 12px;
    text-align: center;
    padding: 6px 0 8px 0;
    transition: all .2s;
}
.empty-block:hover {
    border-color: #c0c4cc;
}
.empty-block:hover .select-icon, .empty-block:hover span {
    color: #adb0b8;
}
.avatar-name {
    width: 60px;
    height: 32px;
    line-height: 13px;
    font-size: 12px;
    background: #f5f5f5;
    display: flex;
    text-align: center;
    align-items: center;
    justify-content: center;
    padding: 0 2px;
    box-sizing: border-box;
}
.avatar-item-wrap {
    display: flex;
    flex-wrap: wrap;
    color: #333333;
}
.avatar-item {
    margin: 0 12px 6px 0;
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;
}
</style>

<style>
.armor-drawer .el-drawer__header {
    display: none;
}
.armor-drawer .el-drawer__body {
    padding: 12px;
    padding-right: 0;
}
</style>
