<template>
    <div class="order-wrap">
        <el-tabs v-model="activeName" @tab-click="handleClick" class="order-tab">
            <el-tab-pane label="开 / 平仓" name="add">
                <div class="table-wrap">
                    <el-form :model="buyForm" label-width="80px" label-position="left"
                        ref="ruleFormRef"
                        :rules="rules"
                        style="width: 400px;padding-left: 24px;">
                        <el-form-item label="交易日期" prop="date">
                            <el-date-picker v-model="buyForm.date" type="datetime" placeholder="请选择日期" :editable="false" :clearable="false" />
                        </el-form-item>
                        <el-form-item label="合约" prop="name">
                            <el-select v-model="buyForm.name" placeholder="请选择合约">
                                <el-option label="eb2301" value="eb2301"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="成交价" prop="price">
                            <el-input-number v-model="buyForm.price" :controls="false" placeholder="请输入成交价" />
                        </el-form-item>
                        <el-form-item label="手数" prop="hands">
                            <el-input-number v-model="buyForm.hands" :controls="false" placeholder="请输入手数" />
                        </el-form-item>
                    </el-form>
                    <div style="padding-left: 24px;">
                        <el-button type="primary" @click="submitHandle(1, 1)">多开</el-button>
                        <el-button type="primary" @click="submitHandle(0, 1)">空开</el-button>
                        <el-button type="danger" @click="submitHandle(1, 0)">平多</el-button>
                        <el-button type="danger" @click="submitHandle(0, 0)">平空</el-button>
                    </div>
                </div>
            </el-tab-pane>
            <el-tab-pane label="交易记录" name="table">
                <el-table class="order-talbe" :data="tableData">
                    <el-table-column prop="name" label="合约" fixed="left" />
                    <el-table-column prop="buyOrSale" label="多/空">
                        <template #default="scope">
                            <span>{{scope.row.buyOrSale ? '多' : '空'}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="price" label="成交价" />
                    <el-table-column prop="hands" label="手数" />
                    <el-table-column prop="openOrClose" label="开/平">
                        <template #default="scope">
                            <span>{{scope.row.openOrClose ? '开' : '平'}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="date" label="交易时间" width="180" />
                    <el-table-column prop="commission" label="手续费" fixed="right" align="center" />
                    <el-table-column prop="profit" label="盈亏" fixed="right" align="center">
                        <template #default="scope">
                            <div v-if="(scope.row.profit || scope.row.profit === 0)">{{scope.row.profit}}</div>
                            <div v-else class="talbe-block-cell">--</div>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import { ref, nextTick, onMounted, reactive, computed } from 'vue'
import { useStore } from 'vuex'
import { fetchOrderInfo, fetchInsertOrder } from '@/api'
import { getDateBetween, dateFormat } from '@/libs/util'
import { ElMessage } from 'element-plus'

export default {
    name: 'income',
    setup() {
        const tableData = ref([])
        const date = ref(new Date())
        const num = ref(0)
        const ruleFormRef = ref()
        const buyForm = reactive({
            date: new Date(),
            name: '',
            buyOrSale: 0,
            openOrClose: 0,
            commission: 0,
            hands: 1,
            price: 0,
        })
        const rules = reactive({
            date: [{ required: true, message: '请选择日期', trigger: 'change' }],
            name: [{ required: true, message: '请选择合约', trigger: 'change' }],
            hands: [{ required: true, message: '请输入手数', trigger: 'change' }],
            price: [{ required: true, message: '请输入成交价', trigger: 'change' }],
        })
        const activeName = ref('add')

        const getTableData = async () => {
            const res = await fetchOrderInfo()
            res.data.sort((a, b) => Date.parse(new Date(b.date)) - Date.parse(new Date(a.date)))
            tableData.value = res.data || []
        }

        const handleClick = async () => {
            getTableData()
        }

        const submitHandle = async (buyOrSale, openOrClose) => {
            const valid = await ruleFormRef.value.validate().catch(e => e)
            if (valid !== true) return
            
            buyForm.buyOrSale = buyOrSale
            buyForm.openOrClose = openOrClose
            buyForm.date = dateFormat(buyForm.date, 'yyyy-MM-dd hh:mm:ss')
            const data = await fetchInsertOrder(buyForm) || {}
            const { success } = data
            if (success) {
                ElMessage.success('操作成功')
                ruleFormRef.value.resetFields()
            }
        }

        return {
            buyForm,
            rules,
            tableData,
            activeName,
            date,
            num,
            ruleFormRef,
            submitHandle,
            handleClick,
        }
    },
}
</script>

<style scoped>
.order-wrap {
    background: #fff;
    position: relative;
    height: 100%;
    box-sizing: border-box;
}
.order-talbe {
    width: 100%;
    height: 100%;
    background: white;
    font-size: 12px;
}
</style>

<style>
.order-tab {
    height: 100%;
}
.order-tab .el-tabs__nav-scroll {
    padding-left: 12px;
}
.order-tab .el-tabs__content {
    height: calc(100% - 55px);
}
.order-tab .el-tab-pane {
    height: 100%;
}
.order-tab .el-table__inner-wrapper {
    height: 100%;
}
.order-tab .el-table__body-wrapper {
    height: calc(100% - 40px);
}
</style>
