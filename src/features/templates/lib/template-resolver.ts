import type { PrintTemplate } from '../types';

export interface ItemTypeIdentifiable {
  isWeight?: boolean;
  type?: number;
  measureName?: string;
  name?: string;
  fullName?: string;
}

/**
 * Определяет, является ли позиция весовым товаром (кг).
 */
export function isWeightProduct(item: ItemTypeIdentifiable): boolean {
  if (item.isWeight === true) return true;
  if (item.type === 1) return true;
  const measure = (item.measureName || '').trim().toLowerCase();
  if (measure === 'кг.' || measure === 'кг' || measure === 'kg' || measure === 'kg.' || measure.includes('кг')) return true;
  if (item.name && (item.name.toLowerCase().includes(' кг') || item.name.toLowerCase().endsWith('кг'))) return true;
  if (item.fullName && (item.fullName.toLowerCase().includes(' кг') || item.fullName.toLowerCase().endsWith('кг'))) return true;
  return false;
}

/**
 * Извлекает PLU-код товара.
 * В Umag PLU весового товара — это просто первый элемент массива алиасов: aliasList[0].
 */
export function extractPluCode(item: {
  plu?: string;
  aliasList?: string[];
  aliases?: string[] | string;
}): string {
  if (item.aliasList && item.aliasList.length > 0 && item.aliasList[0]) {
    return String(item.aliasList[0]).trim();
  }
  if (Array.isArray(item.aliases) && item.aliases.length > 0 && item.aliases[0]) {
    return String(item.aliases[0]).trim();
  }
  return item.plu ? String(item.plu).trim() : '';
}

/**
 * Находит основной шаблон для штучных товаров.
 */
export function findDefaultPieceTemplate(
  templates?: PrintTemplate[]
): PrintTemplate | undefined {
  if (!templates || templates.length === 0) return undefined;

  return (
    templates.find((t) => t.config?.isDefaultPiece) ||
    templates.find((t) => t.config?.targetType === 'piece' && t.isDefault) ||
    templates.find((t) => t.config?.targetType === 'piece') ||
    templates.find((t) => t.isDefault && t.config?.targetType !== 'weight') ||
    templates.find((t) => !t.name.toLowerCase().includes('весов')) ||
    templates[0]
  );
}

/**
 * Находит основной шаблон для весовых товаров.
 */
export function findDefaultWeightTemplate(
  templates?: PrintTemplate[]
): PrintTemplate | undefined {
  if (!templates || templates.length === 0) return undefined;

  return (
    templates.find((t) => t.config?.isDefaultWeight) ||
    templates.find((t) => t.config?.targetType === 'weight' && (t.config?.isDefaultWeight || t.isDefault)) ||
    templates.find((t) => t.config?.targetType === 'weight') ||
    templates.find((t) => t.name.toLowerCase().includes('весов')) ||
    templates.find((t) => t.isDefault) ||
    templates[0]
  );
}

/**
 * Автоматически выбирает наиболее подходящий шаблон для конкретного товара:
 * - Если forcedTemplateId передан и !== 'auto' -> использует явно выбранный пользователем шаблон.
 * - Если весовой товар -> выбирает шаблон для весовых (с PLU).
 * - Если штучный товар -> выбирает шаблон для штучных (со штрихкодом).
 */
export function resolveItemTemplate(
  item: ItemTypeIdentifiable,
  templates?: PrintTemplate[],
  forcedTemplateId?: string
): PrintTemplate | undefined {
  if (!templates || templates.length === 0) return undefined;

  // 1. Ручной принудительный выбор конкретного шаблона
  if (forcedTemplateId && forcedTemplateId !== 'auto') {
    const forced = templates.find((t) => t.id === forcedTemplateId);
    if (forced) return forced;
  }

  // 2. Автоматический выбор по типу товара
  if (isWeightProduct(item)) {
    return findDefaultWeightTemplate(templates);
  } else {
    return findDefaultPieceTemplate(templates);
  }
}
