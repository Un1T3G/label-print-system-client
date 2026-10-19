'use client';

import React from 'react';
import type { LabelElement, PrintTemplateConfig } from '../../types';
import type { SampleProduct } from '../../constants/sample-products';
import { getElementDefinition } from '../../model/element-registry';

interface LabelLiveElementProps {
  element: LabelElement;
  config: PrintTemplateConfig;
  activeProduct: SampleProduct;
  currentDate: string;
}

export function LabelLiveElement(props: LabelLiveElementProps) {
  const definition = getElementDefinition(props.element.type);
  const Component = definition.RenderPreview;
  return <Component {...props} />;
}
