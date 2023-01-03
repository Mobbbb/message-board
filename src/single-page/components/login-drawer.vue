<template>
    <el-drawer v-model="drawerShowStatus" direction="rtl" :size="250">
        <template #title>
            <h4>登录</h4>
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
            <div class="login-btn-wrap">
                <gc-button type="active" @on-click="clickLogin" :width="70">登录</gc-button>
            </div>
        </template>
    </el-drawer>
</template>

<script>
import { mapState, mapGetters ,mapMutations, mapActions } from 'vuex'
import { fetchUserLogin } from '@/api/index'
import { addPrivateRoute } from '@/router'
import GcButton from '@/components/gc-button.vue'

export default {
    name: 'login-drawer',
    components: {
        GcButton,
    },
    data() {
        return {
            username: '',
            password: '',
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
        ...mapState('app', [
            'showLoginDrawerStatus',
        ]),
        ...mapGetters('app', [
            'isWhiteUser',
        ]),
    },
    methods: {
        ...mapMutations('app', [
            'setLoginDrawerStatus',
        ]),
        ...mapActions('app', [
            'INIT_USER',
        ]),
        enterHandle() {
            this.clickLogin()
        },
        async clickLogin() {
            if (!this.username || !this.password) {
                this.$message.error('账号/密码不得为空')
            } else {
                const result = await fetchUserLogin(this.username, this.password)
                this.afterSubmit(result)
            }
        },
        afterSubmit(result) {
            if (result.success) {
                this.setLoginDrawerStatus(false)
                this.INIT_USER()
                this.$message.success(result.msg)
                this.username = ''
                this.password = ''
                if (this.isWhiteUser) {
                    addPrivateRoute()
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
.login-btn-wrap {
    display: flex;
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
