import { z } from 'zod';

export const LoginRequestSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('El email no es válido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const UserInfoSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
  role: z.string(),
  capabilities: z.array(z.string()),
});

export const LoginResponseSchema = z.object({
  token: z.string(),
  user: UserInfoSchema,
});

export type UserInfo = z.infer<typeof UserInfoSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
