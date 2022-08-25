<template>
    <el-drawer v-model="drawerShowStatus" direction="rtl" :size="250">
        <template #title>
            <h4 v-if="isLoginType">登录</h4>
            <h4 v-else>注册</h4>
        </template>
        <template #default>
            <div class="input-item-wrap">
                <span>账号：</span>
                <el-input v-model="username" @keyup.enter="enterHandle" placeholder="请输入账号"></el-input>
            </div>
            <div class="input-item-wrap">
                <span>密码：</span>
                <el-input v-model="password" @keyup.enter="enterHandle" show-password placeholder="请输入密码"></el-input>
            </div>
            <div class="input-item-wrap" v-if="!isLoginType">
                <span>密码：</span>
                <el-input v-model="twicePwd" @keyup.enter="enterHandle" show-password placeholder="请再次输入密码"></el-input>
            </div>
            <div class="login-tips-wrap">
                <p>* 账号密码长度至少6位</p>
            </div>
            <div class="login-btn-wrap" v-if="isLoginType">
                <gc-button type="active" @on-click="clickLogin" :width="70">登录</gc-button>
                <gc-button @on-click="changeTypeHandle" :width="70">注册</gc-button>
            </div>
            <div class="login-btn-wrap register-btn-wrap" v-else>
                <gc-button type="active" @on-click="clickRegister" :width="70">注册</gc-button>
                <span @click="changeTypeHandle" class="back-btn">返回登陆</span>
            </div>
        </template>
    </el-drawer>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'
import { fetchUserLogin, fetchUserRegister } from '@/api/index'

const LOGIN = 'login'
const REGISTER = 'register'

export default {
    name: 'login-pane',
    data() {
        return {
            username: '',
            password: '',
            twicePwd: '',
            type: LOGIN,
        }
    },
    computed: {
        drawerShowStatus: {
            get() {
                return this.showLoginDrawerStatus
            },
            set(value) {
                this.setLoginDrawerStatus(value)
            },
        },
        isLoginType() {
            return this.type === LOGIN
        },
        ...mapState('app', [
            'showLoginDrawerStatus',
        ]),
    },
    methods: {
        ...mapMutations('app', [
            'setLoginDrawerStatus',
        ]),
        ...mapActions('app', [
            'INIT',
        ]),
        enterHandle() {
            if (this.isLoginType) {
                this.clickLogin()
            } else {
                this.clickRegister()
            }
        },
        changeTypeHandle() {
            this.type = this.isLoginType ? REGISTER : LOGIN
        },
        async clickLogin() {
            if (!this.username || !this.password) {
                this.$message.error('账号/密码不得为空')
            } else {
                const result = await fetchUserLogin(this.username, this.password)
                this.afterSubmit(result)
            }
        },
        async clickRegister() {
            if (this.twicePwd !== this.password) {
                this.$message.error('两次密码输入不一致')
            } else if (this.username.length > 15 || this.password.length > 15) {
                this.$message.error('账号/密码不可超过15位')
            } else if (this.username.length < 6 || this.password.length < 6) {
                this.$message.error('账号/密码至少6位')
            } else {
                const result = await fetchUserRegister(this.username, this.password)
                this.afterSubmit(result)
            }
        },
        afterSubmit(result) {
            if (result.success) {
                this.setLoginDrawerStatus(false)
                this.$message.success(result.msg)
                this.INIT()
                this.username = ''
                this.password = ''
                this.twicePwd = ''
                this.type = LOGIN
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
.login-btn-wrap {
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
}
.register-btn-wrap {
    justify-content: space-between;
}
.back-btn {
    color: #00b5e5;
    cursor: pointer;
    font-size: 12px;
    height: 16px;
    line-height: 16px;
}
.back-btn:hover {
    text-decoration: underline;
}
</style>
