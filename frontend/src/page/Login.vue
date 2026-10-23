<template>
    <div>
        this is login page
    </div>
    <LoginForm />
</template>

<script setup lang="ts">
import LoginForm from '../components/common/LoginForm.vue'

import { useUserStore } from '../store/useUserStore.ts'

const userStore = useUserStore()


</script>

<style scoped>
</style>