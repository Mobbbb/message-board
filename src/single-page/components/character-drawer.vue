<template>
    <div class="character-drawer">
        <div class="avatar-wrap" @click="showCharacterPanelHandle">
            <div class="avatar-bg" :style="currentImage">
                <img class="avatar-image" :src="currentCharacter.avatar" v-if="currentCharacter.avatar">
            </div>
            <div class="avatar-name">{{currentCharacter.name}}</div>
        </div>
        <el-drawer v-model="showCharacterPanel" direction="ltr" :size="drawerWidth" :with-header="false">
            <template #default>
                <div class="avatar-item-wrap">
                    <div class="avatar-item"
                        @click="changeCurrentCharacter(item)"
                        v-for="item in CHARACTERS"
                        :key="item">
                        <div class="avatar-bg" :style="avatarImage(item)">
                            <img class="avatar-image" :src="item.avatar">
                            <img class="nature-image"
                                :src="`/resource/genshin-equipment/image/${OBJ_MAP[item.nature]}.png`">
                            <el-icon class="lock-icon"
                                    v-if="item.locked"
                                    @click.stop="lockHandle(item)"><Lock />
                            </el-icon>
                            <el-icon class="lock-icon unlock-icon"
                                    v-else-if="item.locked === 0"
                                    @click.stop="lockHandle(item)"><Unlock />
                            </el-icon>
                        </div>
                        <div class="avatar-name">{{item.name}}</div>
                    </div>
                </div>
            </template>
        </el-drawer>
    </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { Lock, Unlock } from '@element-plus/icons-vue'
import OBJ_MAP from '@/config/obj-map'

export default {
    name: 'character-drawer',
    components: {
        Lock,
        Unlock,
    },
    setup() {
        const store = new useStore()

        const setShowCharacterPanel = (status) => store.commit('app/setShowCharacterPanel', status)
        const setCurrentCharacter = (params) => store.commit('character/setCurrentCharacter', params)
        const seArmorList = () => store.dispatch('character/seArmorList')
        const changeLockStatusAction = (params) => store.dispatch('character/changeLockStatusAction', params)
        const SET_INIT_PROPERTY = () => store.dispatch('app/SET_INIT_PROPERTY')
        const currentCharacter = computed(() => store.state.character.currentCharacter)
        const overMediaCritical = computed(() => store.getters['app/overMediaCritical'])

        const showCharacterPanelHandle = () => {
            setShowCharacterPanel(true)
        }

        const changeCurrentCharacter = (value) => {
            setCurrentCharacter(value)
            localStorage.setItem('selectedCharacter', value.name)
            seArmorList()
            SET_INIT_PROPERTY()
            setShowCharacterPanel(false)
        }

        const showCharacterPanel = computed({
            get() {
                return store.state.app.showCharacterPanel
            },
            set(value) {
                setShowCharacterPanel(value)
            },
        })

        const drawerWidth = computed(() => overMediaCritical.value ? 234 : 352)

        const lockHandle = (item) => {
            let status = 0
            if (item.locked) status = 0
            else if (item.locked === 0) status = 1

            changeLockStatusAction({
                id: item.lockId,
                status,
            })
        }

        return {
            OBJ_MAP,
            currentCharacter,
            CHARACTERS: computed(() => store.state.app.CHARACTERS), // 角色列表
            currentImage: computed(() => {
                return {
                    backgroundImage: currentCharacter.value.star >= 5
                        ? 'url(/resource/genshin-equipment/image/star5.png)'
                        : 'url(/resource/genshin-equipment/image/star4.png)',
                }
            }),
            avatarImage: computed(() => (params) => {
                return {
                    backgroundImage: params.star >= 5
                        ? 'url(/resource/genshin-equipment/image/star5.png)'
                        : 'url(/resource/genshin-equipment/image/star4.png)',
                }
            }),
            drawerWidth,
            showCharacterPanel,
            showCharacterPanelHandle,
            changeCurrentCharacter,
            lockHandle,
        }
    },
}
</script>

<style scoped>
.avatar-wrap {
    margin-right: 12px;
    border-radius: 4px;
    overflow: hidden;
    flex-shrink: 0;
    color: #333333;
    cursor: pointer;
}
.avatar-bg {
    width: 106px;
    height: 106px;
    background-size: 100% 100%;
    position: relative;
}
.avatar-bg .avatar-image {
    width: 106px;
    height: 106px;
}
.avatar-bg .nature-image {
    width: 24px;
    height: 24px;
    background-size: 100% 100%;
    position: absolute;
    top: 0;
    left: 0;
}
.lock-icon {
    position: absolute;
    right: 2px;
    top: 2px;
    font-size: 16px;
    background: #495467;
    color: #fc897b;
    border: 1px solid #4d545e;
    border-radius: 4px;
    padding: 1px;
}
.unlock-icon {
    color: #9da0a7;
    background: #f1eee9;
    border-color: #d0cec7;
}
.avatar-name {
    text-align: center;
    background: #f5f5f5;
    padding: 4px 0;
}
.avatar-item-wrap {
    display: flex;
    flex-wrap: wrap;
    color: #333333;
}
.avatar-item {
    margin: 0 6px 6px 0;
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;
}
</style>

<style>
.character-drawer .el-drawer__body {
    padding: 8px;
    padding-right: 0;
}
</style>
