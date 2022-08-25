<template>
    <el-popover :placement="overMediaCritical ? 'left-end' : 'left-start'" :width="280" trigger="click">
        <template #reference>
            <div class="main-tips">
                <el-icon class="tips-icon"><info-filled /></el-icon>
                <span>使用指导</span>
            </div>
        </template>
        <div class="tips-content">
            <p><span>·</span> 角色/武器等级为90级</p>
            <p><span>·</span> 技能等级为10级（计算命座加成为13级）</p>
            <p><span>·</span> 攻击对象为公义（即 LV.90 海乱鬼）</p>
            <p><span>·</span> 圣遗物页面的
                <span class="key-point">『全选』</span>功能，将勾选所有未被角色
                <span class="key-point">『加锁』</span>的圣遗物参与计算。（不会勾选与自身属性不符的空之杯）
            </p>
            <p><span>·</span> 装备过圣遗物的角色，在角色切换面板头像的右上角会出现
                <span class="key-point">『加锁』</span>图标。被加锁的角色，其装备着的圣遗物，将不会随
                <span class="key-point">『全选』</span>按钮被勾选。
            </p>
            <p><span>·</span> 角色列表/武器列表/辅助型队友列表/圣遗物套装，将不会自动获取最新数据，可点击旁边的
                <span class="click-text" @click="refreshHandle">『刷新』</span>图标获取最新数据。
                <span class="key-point">当程序不可用时，也可尝试点击刷新</span>
            </p>
            <p><span>·</span> 有任何意见或建议，可联系邮箱 {{eMail}} <span class="click-text" @click="copyHandle">『复制』</span></p>
        </div>
    </el-popover>
</template>

<script>
import { computed } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'

export default {
    name: 'main-tips',
    components: {
        InfoFilled,
    },
    setup() {
        const store = new useStore()

        const eMail = '1195154493@qq.com'
        const UPDATE_JSON_DATA = () => store.dispatch('app/UPDATE_JSON_DATA')
        const overMediaCritical = computed(() => store.getters['app/overMediaCritical'])

        const refreshHandle = () => {
            UPDATE_JSON_DATA()
        }

        const copyHandle = () => {
            navigator.clipboard.writeText(eMail).then(() => {
                ElMessage.success('复制成功！')
            }, () => {
                ElMessage.error('您的浏览器版本过低，请手动复制！')
            })
        }

        return {
            eMail,
            overMediaCritical,
            refreshHandle,
            copyHandle,
        }
    },
}
</script>

<style scoped>
.main-tips {
    position: absolute;
    width: 28px;
    height: 78px;
    bottom: 0;
    right: -40px;
    z-index: 99;
    background-color: white;
    border: 1px solid #e7e7e7;
    color: #505050;
    border-radius: 2px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 5px;
}
.main-tips:hover {
    cursor: pointer;
    background: #f8f8f8;
}
.tips-icon {
    font-size: 15px;
    margin-bottom: 3px;
}
.main-tips span {
    display: inline-block;
    font-size: 12px;
    line-height: 14px;
    width: 12px;
}
.tips-content p {
    margin-top: 4px;
}
.tips-content p span {
    font-weight: bold;
}
.key-point {
    color: #e73d3d;
}
.click-text {
    color: #4ea1db;
}
.click-text:hover {
    cursor: pointer;
    color: #ca0c16;
}
</style>
