import { z } from 'zod';

export const loginSchema = z.object({
  login: z.string().trim().min(1, 'Заполните логин'),
  password: z.string().min(4, 'Минимальная длина пароля — 4 символа'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
