import type React from 'react';
import type { LucideIcon } from 'lucide-react';
import type { LabelElement, LabelElementType, PrintTemplateConfig } from '../types';
import type { SampleProduct } from '../constants/sample-products';

export interface ElementRenderProps {
  element: LabelElement;
  config: PrintTemplateConfig;
  activeProduct: SampleProduct;
  currentDate: string;
}

export interface ElementInspectorProps {
  element: LabelElement;
  onUpdate: <K extends keyof LabelElement>(key: K, value: LabelElement[K]) => void;
}

export interface ElementCapabilities {
  hasContent?: boolean;
  contentPlaceholder?: string;
  hasPrefixSuffix?: boolean;
  hasTypography?: boolean;
  hasStyleModifiers?: boolean;
  hasBarcodeSettings?: boolean;
  hasPluSettings?: boolean;
  hasQrSettings?: boolean;
  hasPriceSettings?: boolean;
  hasDividerSettings?: boolean;
}

export interface ElementDefinition {
  type: LabelElementType;
  label: string;
  description: string;
  icon: LucideIcon;
  defaultConfig: Partial<LabelElement>;
  capabilities: ElementCapabilities;
  RenderPreview: React.ComponentType<ElementRenderProps>;
}
