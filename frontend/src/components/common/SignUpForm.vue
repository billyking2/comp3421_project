<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="120px"
  >
    <el-form-item
      label="Username"
      prop="username"
    >
      <el-input
        ref="usernameInput"
        v-model="form.username"
        placeholder="Username"
        clearable
      />
    </el-form-item>

    <el-form-item
      label="Email"
      prop="email"
    >
      <el-input
        v-model="form.email"
        type="email"
        placeholder="Email"
        clearable
      />
    </el-form-item>

    <el-form-item
      label="Password"
      prop="password"
    >
      <el-input
        v-model="form.password"
        type="password"
        placeholder="Password"
        show-password
      />
    </el-form-item>

    <el-alert
      v-if="error"
      :title="error_msg"
      type="error"
      :closable="false"
      class="mb-2"
    />

    <el-form-item>
      <el-button
        type="success"
        round
        :loading="isLoading"
        :disabled="isLoading"
        @click="signUp"
      >
        {{ isLoading ? 'Signing Up...' : 'Sign Up' }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  onMounted,
  useTemplateRef
} from "vue";

import type {
  FormInstance,
  FormRules
} from "element-plus";

import { useRouter } from "vue-router";
import { signUp as signUpService } from "../../services/authService";
import { getErrorMessage, useAuthStatus } from '../../utils/authStatus';
import {usernameRules, passwordRules} from '../../utils/formRule'

const router = useRouter();

const formRef = ref<FormInstance>();

const form = reactive({
  username: "",
  email: "",
  password: "",
});

const rules = reactive<FormRules>({
  username: usernameRules,

  email: [
    {
      required: true,
      message: 'Please enter email',
      trigger: 'blur',
    },
    {
      type: 'email',
      message: 'Invalid email format',
      trigger: 'blur',
    },
  ],

  password: passwordRules,
})

const {
  isLoading,
  error,
  error_msg,
} = useAuthStatus()

const usernameInput =
  useTemplateRef("usernameInput");

onMounted(() => {
  usernameInput.value?.focus();
});

async function signUp() {
  if (!formRef.value) return;

  const valid = await formRef.value
    .validate()
    .catch(() => false);

  if (!valid) return;

  try {
    error.value = false;
    error_msg.value = "";

    isLoading.value = true;

    await signUpService(
      form.username,
      form.email,
      form.password
    );

    router.push("/login");

  } catch (err: any) {
    error.value = true;

    error_msg.value=error_msg.value = getErrorMessage(err);
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.sign-up-btn {
  background-color: rgb(240, 242, 244);
  color: black;
}

.sign-up-btn:hover {
  background-color: #67c23a;
  color: aliceblue;
}
</style>
