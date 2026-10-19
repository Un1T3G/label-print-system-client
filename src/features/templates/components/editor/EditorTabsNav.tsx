'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui';
import { Layers, Sparkles, Maximize2, Printer } from 'lucide-react';
import type { EditorTabType } from '../../hooks/use-template-editor';

interface EditorTabsNavProps {
  activeTab: EditorTabType;
  onTabChange: (tab: EditorTabType) => void;
}

const TABS: { id: EditorTabType; label: string; icon: React.ReactNode }[] = [
  { id: 'elements', label: 'Конструктор элементов', icon: <Layers className="size-3.5" /> },
  { id: 'presets', label: 'Готовые макеты', icon: <Sparkles className="size-3.5" /> },
  { id: 'geometry', label: 'Размеры и рамка', icon: <Maximize2 className="size-3.5" /> },
  { id: 'printer', label: 'Принтер (TSPL)', icon: <Printer className="size-3.5" /> },
];

export function EditorTabsNav({ activeTab, onTabChange }: EditorTabsNavProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(val) => onTabChange(val as EditorTabType)}
      className="w-full"
    >
      <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 h-auto p-1 gap-1">
        {TABS.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="flex items-center gap-1.5 py-2 text-xs font-semibold"
          >
            {tab.icon}
            <span className="truncate">{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
