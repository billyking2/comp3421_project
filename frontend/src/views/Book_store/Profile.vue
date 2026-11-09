<template>
  <main class="profile-page">
    <FormCard
      eyebrow="YOUR ACCOUNT"
      title="Account settings"
      title-id="profile-title"
    >
      <div class="profile-sections">
        <section class="profile-section" aria-labelledby="personal-title">
          <h2 id="personal-title">Personal details</h2>
          <p class="profile-intro">You may change your username and email address here.</p>

          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-position="top"
            class="auth-form"
            @submit.prevent="saveProfile"
          >
            <el-form-item label="Username" prop="username">
              <el-input
                v-model.trim="form.username"
                autocomplete="username"
                maxlength="50"
                clearable
                size="large"
                :disabled="loading"
              />
            </el-form-item>

            <el-form-item label="Email" prop="email">
              <el-input
                v-model.trim="form.email"
                type="email"
                autocomplete="email"
                maxlength="100"
                clearable
                size="large"
                :disabled="loading"
              />
            </el-form-item>

            <el-alert
              v-if="error"
              :title="error"
              type="error"
              show-icon
              :closable="false"
              class="auth-error"
            />
            <el-alert
              v-if="success"
              title="Your profile has been updated."
              type="success"
              show-icon
              :closable="false"
              class="profile-success"
            />

            <el-button
              class="auth-submit"
              type="primary"
              :loading="saving"
              :disabled="loading || saving"
              @click="saveProfile"
            >
              {{ saving ? 'Saving changes...' : 'Save changes' }}
            </el-button>
          </el-form>
        </section>

        <section class="profile-section password-section" aria-labelledby="password-title">
          <h2 id="password-title">Change password</h2>
          <p class="profile-intro">Enter your current password before choosing a new one.</p>

          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-position="top"
            class="auth-form"
            @submit.prevent="savePassword"
          >
            <el-form-item label="Current password" prop="currentPassword">
              <el-input
                v-model="passwordForm.currentPassword"
                type="password"
                autocomplete="current-password"
                show-password
                size="large"
                :disabled="changingPassword"
              />
            </el-form-item>

            <el-form-item label="New password" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                autocomplete="new-password"
                show-password
                size="large"
                :disabled="changingPassword"
              />
            </el-form-item>

            <el-form-item label="Confirm new password" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                autocomplete="new-password"
                show-password
                size="large"
                :disabled="changingPassword"
              />
            </el-form-item>

            <el-alert
              v-if="passwordError"
              :title="passwordError"
              type="error"
              show-icon
              :closable="false"
              class="auth-error"
            />
            <el-alert
              v-if="passwordSuccess"
              title="Your password has been updated."
              type="success"
              show-icon
              :closable="false"
              class="profile-success"
            />

            <el-button
              class="auth-submit"
              type="primary"
              :loading="changingPassword"
              :disabled="loading || changingPassword"
              @click="savePassword"
            >
              {{ changingPassword ? 'Updating password...' : 'Update password' }}
            </el-button>
          </el-form>
        </section>
      </div>
    </FormCard>
  </main>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import type { FormInstance, FormItemRule, FormRules } from 'element-plus';
import FormCard from '../../components/common/FormCard.vue';
import {
  getProfile,
  updateProfile,
  updateProfilePassword,
} from '../../services/authService';
import { useUserStore } from '../../store/useUserStore';
import { getErrorMessage } from '../../utils/authStatus';
import {
  emailRules,
  passwordRules as sharedPasswordRules,
  usernameRules,
} from '../../utils/formRule';

const userStore = useUserStore();
const formRef = ref<FormInstance>();
const passwordFormRef = ref<FormInstance>();
const loading = ref(true);
const saving = ref(false);
const changingPassword = ref(false);
const error = ref('');
const success = ref(false);
const passwordError = ref('');
const passwordSuccess = ref(false);
const form = reactive({
  username: '',
  email: '',
});
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const rules: FormRules = {
  username: usernameRules,
  email: emailRules,
};

const validatePasswordConfirmation: FormItemRule['validator'] = (_rule, value, callback) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('Passwords do not match'));
    return;
  }
  callback();
};

const passwordRules: FormRules = {
  currentPassword: [
    { required: true, message: 'Please enter your current password', trigger: 'blur' },
  ],
  newPassword: [...sharedPasswordRules],
  confirmPassword: [
    { required: true, message: 'Please confirm your new password', trigger: 'blur' },
    { validator: validatePasswordConfirmation, trigger: 'blur' },
  ],
};

onMounted(() => {
  void loadProfile();
});

async function loadProfile(): Promise<void> {
  error.value = '';
  try {
    const { data } = await getProfile();
    form.username = data.username;
    form.email = data.email;
  } catch (cause) {
    error.value = getErrorMessage(cause);
  } finally {
    loading.value = false;
  }
}

async function saveProfile(): Promise<void> {
  if (!formRef.value || saving.value) return;

  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  saving.value = true;
  error.value = '';
  success.value = false;

  try {
    const { data } = await updateProfile({
      username: form.username,
      email: form.email,
    });
    form.username = data.username;
    form.email = data.email;
    userStore.setUsername(data.username);
    success.value = true;
  } catch (cause) {
    error.value = getErrorMessage(cause);
  } finally {
    saving.value = false;
  }
}

async function savePassword(): Promise<void> {
  if (!passwordFormRef.value || changingPassword.value) return;

  const valid = await passwordFormRef.value.validate().catch(() => false);
  if (!valid) return;

  changingPassword.value = true;
  passwordError.value = '';
  passwordSuccess.value = false;

  try {
    await updateProfilePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
    passwordForm.currentPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
    passwordSuccess.value = true;
    passwordFormRef.value.resetFields();
  } catch (cause) {
    passwordError.value = getErrorMessage(cause);
  } finally {
    changingPassword.value = false;
  }
}
</script>

<style scoped>
.profile-page {
  min-height: calc(100vh - 60px);
  padding: 1px 0;
  background:
    radial-gradient(ellipse at 86% 0%, rgb(226 210 187 / 24%), transparent 34rem),
    #f9f1e6;
}

.profile-page :deep(.form-card) {
  width: min(calc(100% - 40px), 900px);
  padding: clamp(30px, 5vw, 56px);
}

.profile-page :deep(.el-input__wrapper) {
  --el-input-text-color: #211d19;
  --el-text-color-regular: #211d19;
}

.profile-page :deep(.el-input__inner) {
  color: #211d19;
}

.profile-page :deep(.el-input__inner::placeholder) {
  color: #746a60;
}

.profile-sections {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(26px, 4vw, 48px);
}

.profile-section h2 {
  margin: 0 0 8px;
  color: #38332d;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 24px;
  font-weight: 400;
}

.profile-intro {
  margin: 0 0 22px;
  color: #827a70;
  font-size: 13px;
  line-height: 1.6;
}

.password-section {
  padding-left: clamp(20px, 3vw, 36px);
  border-left: 1px solid #d7d1c8;
}

.profile-success {
  margin-bottom: 18px;
}

@media (max-width: 720px) {
  .profile-sections {
    grid-template-columns: 1fr;
  }

  .password-section {
    padding-top: 28px;
    padding-left: 0;
    border-top: 1px solid #d7d1c8;
    border-left: 0;
  }
}
</style>
