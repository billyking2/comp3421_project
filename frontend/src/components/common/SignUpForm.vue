<template>
  <FormCard eyebrow="JOIN THE BOOKSHOP" title="Create your account" title-id="sign-up-title">
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="auth-form"
    >
      <el-form-item
        label="Username"
        prop="username"
      >
        <el-input
          ref="usernameInput"
          v-model="form.username"
          placeholder="Choose a username"
          autocomplete="username"
          clearable
          size="large"
        />
      </el-form-item>

      <el-form-item
        label="Email"
        prop="email"
      >
        <el-input
          v-model="form.email"
          type="email"
          placeholder="example@gmail.com"
          autocomplete="email"
          clearable
          size="large"
        />
      </el-form-item>

      <el-form-item
        label="Password"
        prop="password"
      >
        <el-input
          v-model="form.password"
          type="password"
          placeholder="Create a password"
          autocomplete="new-password"
          show-password
          size="large"
        />
      </el-form-item>

      <el-alert
        v-if="error"
        :title="error_msg"
        type="error"
        show-icon
        :closable="false"
        class="auth-error"
      />

      <el-button
        class="auth-submit"
        type="primary"
        :loading="isLoading"
        :disabled="isLoading"
        @click="signUp"
      >
        {{ isLoading ? 'Creating account...' : 'Create account' }}
      </el-button>
    </el-form>

    <template #footer>
      <span>Already have an account?</span>
      <RouterLink to="/signin" class="auth-link">Sign in</RouterLink>
    </template>
  </FormCard>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import FormCard from './FormCard.vue';
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
import { emailRules, passwordRules, usernameRules } from '../../utils/formRule'

const router = useRouter();

const formRef = ref<FormInstance>();

const form = reactive({
  username: "",
  email: "",
  password: "",
});

const rules = reactive<FormRules>({
  username: usernameRules,

  email: emailRules,

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
