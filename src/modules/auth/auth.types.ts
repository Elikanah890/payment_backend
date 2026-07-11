import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export const resetPasswordSchema = z.object({
  userId: z.string().min(1),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginDto = z.infer<typeof loginSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
