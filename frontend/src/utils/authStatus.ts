import { ref } from 'vue'
import axios from 'axios'

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

export function getErrorMessage(err: unknown) {
  if (axios.isAxiosError(err)) {
    if (err.response) {
      return err.response.data.error
    }

    if (err.request) {
      return 'Cannot connect to server'
    }
  }

  return 'Unexpected error'
}
