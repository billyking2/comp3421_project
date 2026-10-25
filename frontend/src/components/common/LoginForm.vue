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
import { useUserStore } from "../../store/useUserStore";
import { login as loginService } from "../../services/authService";
import { useRouter } from "vue-router";

const username = ref("");
const password = ref("");

const usernameInput = useTemplateRef("usernameInput");

onMounted(() => {
  usernameInput.value?.focus();
});


async function login() {
  try {
    const { data } = await loginService(
      username.value,
      password.value
    );

    useUserStore().setUser({
      userId: data.userId,
      username: data.username,
      role: data.role,
    });

    const router = useRouter();
    if (data.role === "admin") {
      router.push("/dashboard");
    } else {
      router.push("/");
    }
  
  } catch (err) {
    console.error(err);
  }
}
</script>

<style scoped></style>
