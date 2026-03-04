import { z } from 'zod';
import { LoginRequestSchema, LoginResponseSchema } from '../schemas/auth.schemas';

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
