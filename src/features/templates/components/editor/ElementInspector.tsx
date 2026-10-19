'use client';

import React from 'react';
import type { LabelElement } from '../../types';
import { Card, CardContent } from '@/shared/ui';
import {
  InspectorHeader,
  InspectorGeneralControls,
  InspectorPrefixSuffixControls,
  InspectorTypographyControls,
  InspectorStyleModifiers,
  InspectorBarcodeControls,
  InspectorQrControls,
  InspectorPriceControls,
  InspectorDividerControls,
  InspectorOffsetControls,
} from './inspector';

interface ElementInspectorProps {
  selectedElement: LabelElement;
  onUpdateSelected: <K extends keyof LabelElement>(key: K, value: LabelElement[K]) => void;
}

export function ElementInspector({
  selectedElement,
  onUpdateSelected,
}: ElementInspectorProps) {
  return (
    <Card className="border-blue-200/80 dark:border-blue-900/60 shadow-xs bg-white dark:bg-slate-900 ring-1 ring-blue-100 dark:ring-blue-950">
      <InspectorHeader element={selectedElement} onUpdate={onUpdateSelected} />

      <CardContent className="p-4 space-y-4">
        <InspectorGeneralControls element={selectedElement} onUpdate={onUpdateSelected} />
        <InspectorPrefixSuffixControls element={selectedElement} onUpdate={onUpdateSelected} />
        <InspectorTypographyControls element={selectedElement} onUpdate={onUpdateSelected} />
        <InspectorStyleModifiers element={selectedElement} onUpdate={onUpdateSelected} />
        <InspectorBarcodeControls element={selectedElement} onUpdate={onUpdateSelected} />
        <InspectorQrControls element={selectedElement} onUpdate={onUpdateSelected} />
        <InspectorPriceControls element={selectedElement} onUpdate={onUpdateSelected} />
        <InspectorDividerControls element={selectedElement} onUpdate={onUpdateSelected} />
        <InspectorOffsetControls element={selectedElement} onUpdate={onUpdateSelected} />
      </CardContent>
    </Card>
  );
}
