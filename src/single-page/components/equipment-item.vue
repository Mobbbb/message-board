<template>
    <div class="equipment-item" :class="equipStatusClass" :style="{ width: `${width}px` }" @click="selectedHandle">
        <div class="equipment-name-wrap">
            <img src="/resource/genshin-equipment/image/equipment-title-bg.png">
            <span class="equipment-name">{{params.name}}</span>
            <div class="selected-status-wrap" v-if="isSelected">
                <div class="selected-bar"></div>
                <div class="selected-icon-wrap">
                    <el-icon class="selected-icon"><select-icon /></el-icon>
                </div>
            </div>
        </div>
        <div class="equipment-main-wrap">
            <div class="equipment-main-left">
                <div class="equipment-type">{{OBJ_MAP[params.type]}}</div>
                <div class="equipment-main-key">{{OBJ_MAP[params.mainAttr.key]}}</div>
                <div class="equipment-main-value">{{params.mainAttr.value}}{{attrUnit(params.mainAttr.type)}}</div>
            </div>
            <div class="equipment-main-right">
                <div class="ed-btn" v-if="finalEquipBtnShowStatus" @click.stop="equipHandle">装备</div>
                <div class="ed-btn disboard-btn"
                    v-else-if="finalDisboardBtnShowStatus"
                    @click.stop="equipHandle">解除</div>
                <div class="armor-image-wrap" v-else>
                    <img class="armor-image" :src="armorImage" />
                </div>
                <!-- <div class="avatar-wrap" v-else-if="characterInfo">
                    <img class="avatar-image" :src="characterInfo.avatar" />
                </div> -->
            </div>
        </div>
        <div class="equipment-middle">
            <div class="equipment-score">{{armorScore}}</div>
            <div class="remove-btn" v-if="showRemoveBtn" @click.stop="removeHandle">删除</div>
        </div>
        <div class="equipment-secondary-wrap">
            <div class="equipment-secondary-item" v-for="(cell, cellIndex) in params.secondaryAttr" :key="cellIndex">
                <div class="equipment-secondary-value">
                    {{OBJ_MAP[cell.key]}}+{{cell.value}}{{attrUnit(cell.type)}}
                </div>
            </div>
        </div>
        <div class="bottom-tips-wrap" v-if="characterInfo">
            <img class="avatar-image" :src="characterInfo.avatar" />
            <span class="bottom-tips-text">{{characterInfo.name}}已装备</span>
        </div>
    </div>
</template>

<script>
import { computed, toRefs } from 'vue'
import { useStore } from 'vuex'
import { Select } from '@element-plus/icons-vue'
import { computedScore } from '@/libs/data-processing'
import OBJ_MAP from '@/config/obj-map'

export default {
    name: 'equipment-item',
    components: {
        SelectIcon: Select,
    },
    props: {
        params: {
            type: Object,
            default: () => {
                return {}
            },
        },
        showEquipBtn: { // 显示装备按钮
            type: Boolean,
            default: false,
        },
        showEquipBtnItem: { // 显示装备按钮
            type: Boolean,
            default: false,
        },
        showRemoveBtn: {
            type: Boolean,
            default: false,
        },
        showSelectedStatus: {
            type: Boolean,
            default: false,
        },
        width: {
            type: Number,
            default: 170,
        },
    },
    setup(props, { emit }) {
        const store = new useStore()
        const { params, showSelectedStatus, showEquipBtn, showEquipBtnItem } = toRefs(props)

        const CHARACTERS_OBJ = computed(() => store.state.app.CHARACTERS_OBJ)
        const COORDINATES_OBJ = computed(() => store.state.app.COORDINATES_OBJ)
        const currentCharacter = computed(() => store.state.character.currentCharacter) // 当前选中的角色
        const CEList = computed(() => store.state.character.CEList) // 所有角色的装备信息(服务器)
        // 当前角色装备的圣遗物id集合(页面)
        const charArmorIdList = computed(() => store.state.character.charArmorIdList)
        // 当前角色装备的圣遗物id集合(服务器)
        const originCharArmorIdList = computed(() => store.getters['character/originCharArmorIdList'])
        // 所有角色装备的圣遗物id集合(页面)
        const allCurrentCharArmorIdList = computed(() => store.getters['character/allCurrentCharArmorIdList'])
        // 所有角色装备的圣遗物id集合(服务器)
        const allOriginCharArmorIdList = computed(() => store.getters['character/allOriginCharArmorIdList'])
        const changeChaArmorItemById = (id) => store.dispatch('character/changeChaArmorItemById', id)
        const saveCharacterAction = () => store.dispatch('character/saveCharacterAction')

        const isEquipedAnyOneOrigin = computed(() => { // 是否被任意角色装备中(服务器)
            return allOriginCharArmorIdList.value.includes(params.value.id.toString())
        })

        const isEquipedAnyOneCurrent = computed(() => { // 是否被任意角色装备中(页面)
            return allCurrentCharArmorIdList.value.includes(params.value.id.toString())
        })

        const isEquipedOrigin = computed(() => { // 是否被当前角色装备中(服务器)
            return originCharArmorIdList.value.includes(params.value.id.toString())
        })

        const isEquipedCurrent = computed(() => { // 是否被当前角色装备中(页面)
            return charArmorIdList.value.includes(params.value.id.toString())
        })

        const armorImage = computed(() => {
            return COORDINATES_OBJ.value[params.value.value].itemImage[params.value.type] || ''
        })

        const equipAble = computed(() => isEquipedOrigin.value || !isEquipedAnyOneOrigin.value) // 是否可装备/解除

        const characterInfo = computed(() => { // 装备该圣遗物角色的信息(服务器)
            let info = null
            CEList.value.forEach(item => {
                if (item.equipmentList.includes(params.value.id.toString())) {
                    info = CHARACTERS_OBJ.value[item.characterName]
                }
            })
            return info
        })

        const finalEquipBtnShowStatus = computed(() => { // 显示装备按钮
            return (equipAble.value && !isEquipedCurrent.value && showEquipBtn.value) ||
                    (equipAble.value && !isEquipedCurrent.value && showEquipBtnItem.value)
        })

        // 显示解除按钮
        const finalDisboardBtnShowStatus = computed(() => {
            return equipAble.value && showEquipBtn.value && isEquipedCurrent.value
        })

        const selectedHandle = () => {
            emit('on-selected', params.value)
        }

        const removeHandle = () => {
            emit('on-remove', params.value)
        }

        const equipHandle = () => { // 装备圣遗物
            changeChaArmorItemById(params.value.id)
            if (equipAble.value && showEquipBtnItem.value) {
                saveCharacterAction() // 直接保存
            }
        }

        return {
            OBJ_MAP,
            isEquipedAnyOneOrigin, // 是否被任意角色装备中(服务器)
            isEquipedOrigin, // 是否被当前角色装备中(服务器)
            isEquipedCurrent, // 是否被当前角色装备中(页面)

            armorImage, // 圣遗物图片信息

            characterInfo, // 装备该圣遗物角色的信息(服务器)

            finalEquipBtnShowStatus,
            finalDisboardBtnShowStatus,
            equipStatusClass: computed(() => showEquipBtn.value ? 'equip-status-wrap' : ''),
            isSelected: computed(() => params.value.selected && showSelectedStatus.value), // 是否被勾选
            // 当前角色装备中(服务器) 或 未被任何角色装备(服务器)
            attrUnit: computed(() => (type) => type === 'percent' ? '%' : ''), // 属性单位
            armorScore: computed(() => { // 圣遗物评分
                let scoreCharacterInfo = {}
                if (isEquipedCurrent.value) {
                    scoreCharacterInfo = currentCharacter.value
                } else if (isEquipedAnyOneCurrent.value && characterInfo.value) {
                    scoreCharacterInfo = characterInfo.value
                }

                return computedScore(params.value, scoreCharacterInfo).toFixed(1)
            }),

            selectedHandle,
            removeHandle,
            equipHandle,
        }
    },
}
</script>

<style scoped>
.equipment-item {
    overflow: hidden;
    border-radius: 4px;
    position: relative;
    height: 254px;
}
.equipment-name-wrap {
    height: 32px;
    width: 100%;
    position: relative;
}
.equipment-name-wrap img {
    height: 100%;
    width: 100%;
}
.equipment-name {
    display: block;
    color: white;
    font-weight: bold;
    font-size: 18px;
    height: 32px;
    line-height: 32px;
    padding: 0 12px;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 9;
}
.selected-status-wrap {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    display: flex;
    z-index: 10;
}
.selected-bar {
    width: 100%;
    height: 4px;
    background: #c0ff40;
}
.selected-icon-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 22px;
    height: 22px;
    background: #c0ff40;
    border-bottom-left-radius: 8px;
}
.selected-icon {
    color: #6c900c;
    font-weight: 900;
}
.equipment-main-wrap {
    padding: 4px 12px;
    background-image: linear-gradient(166deg, #615b57 7%, #e4ab56);
    color: white;
    font-weight: bold;
    font-size: 12px;
    border-bottom: 2px solid #99744d;
    display: flex;
    position: relative;
}
.equipment-main-left {
    width: 95px;
    flex-shrink: 0;
}
.equipment-type {
    height: 14px;
    line-height: 14px;
    margin-bottom: 24px;
}
.equipment-main-key {
    height: 14px;
    line-height: 14px;
    color: rgb(255, 255, 255, 0.6);
}
.equipment-main-value {
    font-size: 20px;
    line-height: 24px;
}
.equipment-main-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
    box-sizing: border-box;
}
.ed-btn {
    width: 50px;
    height: 50px;
    line-height: 50px;
    text-align: center;
    background: #e6e1d5;
    border-radius: 50%;
    transform: scale(0.8);
    margin-right: -6px;
    color: #5a596d;
    cursor: pointer;
}
.disboard-btn {
    color: #e32626;
}
.armor-image {
    height: 48px;
    width: 48px;
    border-radius: 50%;
    display: block;
}
.equipment-secondary-wrap {
    padding: 8px 12px 12px 12px;
    color: #5a596d;
    font-weight: bold;
    font-size: 13px;
    background: #e3dfd4;
    height: 82px;
}
.equipment-secondary-item {
    display: flex;
    align-items: center;
}
.equipment-secondary-item::before {
    content: '';
    display: block;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: #5a596d;
    margin-left: 2px;
}
.equipment-secondary-value {
    padding-left: 4px;
    height: 18px;
    line-height: 18px;
}
.equipment-middle {
    height: 17px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 12px 0 12px;
    background: #e3dfd4;
}
.equipment-level {
    color: white;
    font-size: 13px;
    font-weight: bold;
    background: #3b3f4f;
    padding: 0 4px;
    padding-top: 1px;
    height: 14px;
    line-height: 14px;
    border-radius: 2px;
}
.remove-btn {
    box-shadow: 0 0px 6px 1px rgb(0 0 0 / 10%);
    font-size: 12px;
    height: 14px;
    line-height: 14px;
    color: #525161;
    border-radius: 8px;
    padding: 1px 7px;
    padding-top: 2px;
    background: #ece6df;
    transition: all .2s;
    transform: scale(0.8);
    margin-right: -8px;
}
.remove-btn:hover {
    background: #f1ece6;
}
.equipment-score {
    color: white;
    font-size: 13px;
    font-weight: bold;
    background: #3b3f4f;
    padding: 0 4px;
    padding-top: 1px;
    height: 14px;
    line-height: 14px;
    border-radius: 2px;
}
.bottom-tips-wrap {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: #ffe7bb;
    display: flex;
    align-items: center;
    height: 20px;
}
.bottom-tips-text {
    color: #5a596d;
    font-weight: bold;
    font-size: 12px;
    margin-left: 35px;
}
.avatar-image {
    position: absolute;
    height: 20px;
    width: 20px;
    top: -2px;
    left: 12px;
    border-radius:  0 0 50% 50%;
}
</style>
