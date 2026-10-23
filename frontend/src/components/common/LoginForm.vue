<template>
  <input
    ref="usernameInput"
    v-model="username"
    type="text"
    placeholder="Username"
  />
  <input type="password" v-model="password" placeholder="Password" />
  <button @click="login">Login</button>
</template>

<script setup lang="ts">
import { ref, useTemplateRef, onMounted } from "vue";
import axios from "axios";
import { useUserStore } from "../../store/useUserStore";
import { login as loginService } from "../../services/authService";

const username = ref("");
const password = ref("");

const usernameInput = useTemplateRef("usernameInput");

onMounted(() => {
  console.log("Username:", username.value);
  console.log("Password:", password.value);
  usernameInput.value?.focus();
});


async function login() {
  try {
    const res = await loginService(
      username.value,
      password.value
    );

    useUserStore().setUser({
      userId: res.data.userId,
      username: res.data.username,
      role: res.data.role,
    });
  } catch (err) {
    console.error(err);
  }
}
</script>

<style scoped></style>
