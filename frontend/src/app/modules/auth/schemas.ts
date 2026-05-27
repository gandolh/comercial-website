import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email invalid'),
  password: z.string().min(1, 'Parola este obligatorie'),
})

export const registerSchema = z.object({
  email: z.string().email('Email invalid'),
  password: z.string().min(8, 'Parola trebuie să aibă cel puțin 8 caractere'),
  passwordConfirm: z.string(),
}).refine((v) => v.password === v.passwordConfirm, {
  path: ['passwordConfirm'],
  message: 'Parolele nu coincid',
})

export const forgotSchema = z.object({ 
  email: z.string().email('Email invalid') 
})

export const resetSchema = z.object({
  password: z.string().min(8, 'Parola trebuie să aibă cel puțin 8 caractere'),
  passwordConfirm: z.string(),
}).refine((v) => v.password === v.passwordConfirm, {
  path: ['passwordConfirm'],
  message: 'Parolele nu coincid',
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotInput = z.infer<typeof forgotSchema>
export type ResetInput = z.infer<typeof resetSchema>
