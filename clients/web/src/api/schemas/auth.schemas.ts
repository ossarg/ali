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

export const LoginResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string().optional(),
});
