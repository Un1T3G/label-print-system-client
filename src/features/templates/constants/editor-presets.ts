export const PRESET_SIZES = [
  { label: '58 × 40 мм', w: 58, h: 40 },
  { label: '40 × 30 мм', w: 40, h: 30 },
  { label: '58 × 30 мм', w: 58, h: 30 },
  { label: '80 × 60 мм', w: 80, h: 60 },
] as const;

export type PresetSize = (typeof PRESET_SIZES)[number];
