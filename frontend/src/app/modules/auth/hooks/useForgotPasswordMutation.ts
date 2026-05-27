import { useMutation } from '@tanstack/react-query'
import { forgotPassword } from '../services/auth'

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: forgotPassword,
  })
}
