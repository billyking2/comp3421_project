import { ref } from 'vue'

export function useAuthStatus() {
  const isLoading = ref(false)
  const error = ref(false)
  const error_msg = ref('')

  return {
    isLoading,
    error,
    error_msg,
  }
}

export function getErrorMessage(err: any) {
  if (err.response) {
    return err.response.data.error
  }

  if (err.request) {
    return 'Cannot connect to server'
  }

  return 'Unexpected error'
}