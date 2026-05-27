import { useMutation } from '@tanstack/react-query'
import { verifyEmail } from '../services/auth'

export function useVerifyEmailMutation() {
  return useMutation({
    mutationFn: verifyEmail,
  })
}
