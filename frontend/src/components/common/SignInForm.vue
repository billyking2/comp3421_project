<template>
  <FormCard eyebrow="WELCOME BACK" title="Sign in to your account" title-id="sign-in-title">
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="auth-form"
      @submit.prevent="signIn"
    >
      <el-form-item label="Username or email" prop="username">
        <el-input
          ref="usernameInput"
          v-model="form.username"
          placeholder="Enter your username or email"
          autocomplete="username"
          clearable
          size="large"
        />
      </el-form-item>

      <el-form-item label="Password" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="Enter your password"
          autocomplete="current-password"
          show-password
          size="large"
          @keyup.enter="signIn"
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
        @click="signIn"
      >
        {{ isLoading ? 'Signing in...' : 'Sign in' }}
      </el-button>
    </el-form>

    <template #footer>
      <span>No Account?</span>
      <RouterLink to="/signup" class="auth-link">Create an account</RouterLink>
    </template>
  </FormCard>
</template>


<script setup lang="ts">
import {
  ref,
  reactive,
  onMounted,
  useTemplateRef
} from 'vue';

import type {
  FormInstance,
  FormRules
} from 'element-plus';

import { useRouter } from 'vue-router';
import FormCard from './FormCard.vue';
import { useUserStore } from '../../store/useUserStore';
import { signIn as loginService } from '../../services/authService';
import { getErrorMessage, useAuthStatus } from '../../utils/authStatus';
import { loginIdentifierRules, passwordRules } from '../../utils/formRule'

const router = useRouter();

const formRef = ref<FormInstance>();

const form = reactive({
  username: '',
  password: '',
});

const rules = reactive<FormRules>({
  username: loginIdentifierRules,
  password: passwordRules,
})

const {
  isLoading,
  error,
  error_msg,
} = useAuthStatus()

const usernameInput =
  useTemplateRef('usernameInput');

onMounted(() => {
  usernameInput.value?.focus();
});

async function signIn() {
  if (!formRef.value) return;
  error_msg.value='';
  const valid =
    await formRef.value.validate()
      .catch(() => false);

  if (!valid) return;

  try {
    error.value = false;

    isLoading.value = true;

    const { data } =
      await loginService(
        form.username,
        form.password
      );

    useUserStore().setUser({
      userId: data.userId,
      username: data.username,
      role: data.role,
    });

    if (data.role === 'admin') {
      await router.push('/dashboard');
    } else {
      await router.push('/');
    }
  } catch (err: any) {
    error.value = true;

    error_msg.value= getErrorMessage(err);
  } finally {
    isLoading.value = false;
  }
}
</script>
