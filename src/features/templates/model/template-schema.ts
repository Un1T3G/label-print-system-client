import { z } from 'zod';

export const createTemplateSchema = z.object({
  name: z.string().trim().min(1, 'Укажите название шаблона'),
  widthMm: z.coerce.number().positive('Ширина должна быть больше 0'),
  heightMm: z.coerce.number().positive('Высота должна быть больше 0'),
  isDefault: z.boolean().optional().default(false),
  config: z.record(z.string(), z.unknown()).optional().default({}),
});

export const updateTemplateSchema = z.object({
  name: z.string().trim().min(1, 'Укажите название шаблона').optional(),
  widthMm: z.coerce.number().positive('Ширина должна быть больше 0').optional(),
  heightMm: z.coerce.number().positive('Высота должна быть больше 0').optional(),
  isDefault: z.boolean().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});

export type CreateTemplateSchemaInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateSchemaInput = z.infer<typeof updateTemplateSchema>;
