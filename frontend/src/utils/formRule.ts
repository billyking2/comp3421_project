import type { FormItemRule } from 'element-plus'

export const usernameRules: FormItemRule[] = [
  {
    required: true,
    message: 'Please enter username',
    trigger: 'blur',
  },
]

export const passwordRules: FormItemRule[] = [
  {
    required: true,
    message: 'Please enter password',
    trigger: 'blur',
  },
  {
    min: 6,
    message: 'Password must be at least 6 characters',
    trigger: 'blur',
  },
]