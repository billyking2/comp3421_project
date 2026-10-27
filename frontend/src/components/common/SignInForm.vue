<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="120px"
    style="max-width: 1200px; padding: auto; margin: auto; min-width: 400px;"
  >
    <el-form-item
      label="Username/Email"
      prop="username"
    >
      <el-input
        ref="usernameInput"
        v-model="form.username"
        placeholder="Username/Email"
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
    />

    <el-form-item>
      <el-button
        type="success"
        round
        :loading="isLoading"
        :disabled="isLoading"
        @click="signIn"
      >
        {{ isLoading ? 'Signing In...' : 'Sign In' }}
      </el-button>
    </el-form-item>
  </el-form>

  <hr />

  <p>Do not have account yet?</p>

  <RouterLink to="/signup">
    <el-button
      type="success"
      round
      class="sign-up-btn"
    >
      SignUp
    </el-button>
  </RouterLink>
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
import { useUserStore } from '../../store/useUserStore';
import { signIn as loginService } from '../../services/authService';
import { getErrorMessage, useAuthStatus } from '../../utils/authStatus';
import {usernameRules, passwordRules} from '../../utils/formRule'

const router = useRouter();

const formRef = ref<FormInstance>();

const form = reactive({
  username: '',
  password: '',
});

const rules = reactive<FormRules>({
  username: usernameRules,
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
