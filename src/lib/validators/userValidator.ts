import { z } from 'zod';
import { UserRole } from '@/types/models';

export const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name cannot exceed 100 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .optional(),
  role: z.nativeEnum(UserRole),
  isActive: z.boolean(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name cannot exceed 100 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type UserFormValidation = z.infer<typeof userSchema>;
export type LoginFormValidation = z.infer<typeof loginSchema>;
export type RegisterFormValidation = z.infer<typeof registerSchema>;

export function validateUser(data: any) {
  return userSchema.safeParse(data);
}

export function validateLogin(data: any) {
  return loginSchema.safeParse(data);
}

export function validateRegister(data: any) {
  return registerSchema.safeParse(data);
}
