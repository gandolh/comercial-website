import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email invalid'),
  password: z.string().min(1, 'Parola este obligatorie'),
})




export type LoginInput = z.infer<typeof loginSchema>
