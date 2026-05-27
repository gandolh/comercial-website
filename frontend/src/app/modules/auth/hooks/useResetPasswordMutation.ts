import { useMutation } from '@tanstack/react-query'
import { resetPassword } from '../services/auth'

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      resetPassword(token, password),
  })
}
