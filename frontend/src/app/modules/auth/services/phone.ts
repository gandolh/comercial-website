import { axiosInstance } from '@core/lib/axios';

export async function requestPhoneCode(phone: string): Promise<void> {
  await axiosInstance.post('/auth/phone/request-code', { phone });
}

export async function verifyPhone(code: string): Promise<void> {
  await axiosInstance.post('/auth/phone/verify', { code });
}
