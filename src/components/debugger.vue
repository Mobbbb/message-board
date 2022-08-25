<template>
    <div class="debugger-wrap">Debugger: {{store.state.app.debuggerText}}</div>
</template>

<script>
import { useStore } from 'vuex'

export default {
    name: 'debugger-wrap',
    setup() {
        const store = new useStore()
        return {
            store,
        }
    },
}
</script>

<style scoped>
.debugger-wrap {
    position: fixed;
    bottom: 4px;
    left: 4px;
    z-index: 100;
}
</style>
