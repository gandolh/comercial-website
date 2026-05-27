import { useMutation } from '@tanstack/react-query'
import { resendVerification } from '../services/auth'

export function useResendVerificationMutation() {
  return useMutation({
    mutationFn: resendVerification,
  })
}
