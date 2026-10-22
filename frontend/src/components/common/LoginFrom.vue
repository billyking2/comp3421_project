

<template>
    <input type="text" ref="usernameInput" v-model="username" placeholder="Username" />
    <input type="password" v-model="password" placeholder="Password" />
    <button @click="login">Login</button>
</template>

<script setup lang="ts">
import { ref,useTemplateRef, onMounted } from 'vue'


const username = ref('')
const password = ref('')

const usernameInput = useTemplateRef('usernameInput')

onMounted(() => {
    console.log('Username:', username.value)
    console.log('Password:', password.value)
    usernameInput.value?.focus()
})

function login() {
    console.log('Logging in with:', username.value, password.value)
}
</script>

<style>

</style>
