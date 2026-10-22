<template>
    <div>
        this is login page
    </div>
    <LoginForm />
</template>

<script setup lang="ts">
import LoginForm from '../components/common/LoginForm.vue'

import { useUserStore } from '../types/useUserStore'

const userStore = useUserStore()

const handleLogin = async () => {
  const response = await ({ userId: "123" })

  userStore.setUserId(response.userId)
}
</script>

<style scoped>
</style>