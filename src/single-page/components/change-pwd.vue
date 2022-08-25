<template>
    <el-drawer v-model="showDrawer" direction="rtl" :size="250">
        <template #title><h4>修改密码</h4></template>
        <template #default>
            <div class="input-item-wrap">
                <span class="change-pwd-span">旧密码：</span>
                <el-input v-model="password" show-password placeholder="输入旧密码"></el-input>
            </div>
            <div class="input-item-wrap">
                <span class="change-pwd-span">新密码：</span>
                <el-input v-model="newPassword" show-password placeholder="输入新密码"></el-input>
            </div>
            <div class="input-item-wrap">
                <span class="change-pwd-span">新密码：</span>
                <el-input v-model="twicePwd" show-password placeholder="再次输入新密码"></el-input>
            </div>
            <div class="login-tips-wrap">
                <p>* 密码长度至少6位</p>
            </div>
            <gc-button @on-click="clickChangePwd" :width="85">修改密码</gc-button>
        </template>
    </el-drawer>
</template>

<script>
import { mapActions } from 'vuex'
import { fetchUserChangePwd } from '@/api/index'

export default {
    name: 'logon-pane',
    props: ['modelValue'],
    data() {
        return {
            password: '',
            newPassword: '',
            twicePwd: '',
        }
    },
    computed: {
        showDrawer: {
            get() {
                return this.modelValue
            },
            set(value) {
                this.$emit('update:modelValue', value)
            },
        },
    },
    methods: {
        ...mapActions('app', [
            'INIT',
        ]),
        async clickChangePwd() {
            if (this.twicePwd !== this.newPassword) {
                this.$message.error('两次新密码输入不一致')
            } else if (this.newPassword.length < 6 || this.newPassword.length > 15) {
                this.$message.error('密码长度要求6-14位')
            } else {
                const result = await fetchUserChangePwd(this.password, this.newPassword)
                if (result.success) {
                    this.$emit('update:modelValue', false)
                    this.$message.success(result.msg)
                    this.INIT()
                    this.password = ''
                    this.newPassword = ''
                    this.twicePwd = ''
                }
            }
        },
    },
}
</script>

<style scoped>
.input-item-wrap {
    margin-bottom: 12px;
    display: flex;
    align-items: center;
}
.input-item-wrap span {
    flex-shrink: 0;
}
.login-tips-wrap {
    margin-bottom: 12px;
    color: #bbb;
    font-size: 12px;
}
.change-pwd-span {
    width: 56px;
    text-align: justify;
    text-align-last: justify;
    white-space: nowrap;
}
</style>
