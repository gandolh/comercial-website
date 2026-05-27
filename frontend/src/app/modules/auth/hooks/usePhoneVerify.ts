import { useMutation, useQueryClient } from '@tanstack/react-query';
import { requestPhoneCode, verifyPhone } from '../services/phone';

export function usePhoneVerify() {
  const queryClient = useQueryClient();

  const request = useMutation({
    mutationFn: requestPhoneCode,
  });

  const verify = useMutation({
    mutationFn: verifyPhone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });

  return { request, verify };
}
