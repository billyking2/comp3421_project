import type { FormItemRule } from 'element-plus'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidUsernameValue(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const username = value.trim()
  return username.length > 0 && username.length <= 50
}

export function isValidEmailValue(value: unknown, maxLength = 100): value is string {
  if (typeof value !== 'string') return false
  const email = value.trim()
  return email.length > 0 && email.length <= maxLength && EMAIL_PATTERN.test(email)
}

export function isValidPasswordValue(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length >= 6 &&
    new TextEncoder().encode(value).length <= 72
  )
}

export const usernameRules: FormItemRule[] = [
  {
    validator: (_rule, value: unknown, callback) => {
      if (!isValidUsernameValue(value)) {
        callback(new Error('Username must be 1–50 characters'))
        return
      }
      callback()
    },
    trigger: 'blur',
  },
]

export const loginIdentifierRules: FormItemRule[] = [
  {
    required: true,
    message: 'Please enter username or email',
    trigger: 'blur',
  },
  {
    max: 100,
    message: 'Username or email must be 100 characters or fewer',
    trigger: 'blur',
  },
]

export const emailRules: FormItemRule[] = [
  {
    validator: (_rule, value: unknown, callback) => {
      if (!isValidEmailValue(value)) {
        callback(new Error('Please enter a valid email address (maximum 100 characters)'))
        return
      }
      callback()
    },
    trigger: 'blur',
  },
]

const passwordLengthRule: FormItemRule = {
  validator: (_rule, value: unknown, callback) => {
    if (!isValidPasswordValue(value)) {
      callback(new Error('Password must be at least 6 characters and at most 72 bytes'))
      return
    }

    callback()
  },
  trigger: 'blur',
}

export const passwordRules: FormItemRule[] = [
  {
    required: true,
    message: 'Please enter password',
    trigger: 'blur',
  },
  passwordLengthRule,
]