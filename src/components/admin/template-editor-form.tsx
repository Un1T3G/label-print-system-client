'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PrintTemplateConfig, CreatePrintTemplateDto, LabelElement, LabelElementType } from '@/lib/types';
import {
  getTemplateElements,
  syncConfigWithElements,
  ELEMENT_PRESET_CATALOG,
  LAYOUT_PRESETS,
  getDefaultElements,
} from '@/lib/label-elements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LabelLivePreview } from '@/components/admin/label-live-preview';
import {
  Save,
  Maximize2,
  Type,
  Barcode,
  Printer,
  Sparkles,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RotateCw,
  Layers,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  QrCode,
  Tag,
  Percent,
  Split,
  Globe,
  Undo2,
  Move,
  SlidersHorizontal,
  Terminal,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { TsplPreviewModal } from '@/components/print/tspl-preview-modal';

interface TemplateEditorFormProps {
  initialName?: string;
  initialWidthMm?: number;
  initialHeightMm?: number;
  initialIsDefault?: boolean;
  initialConfig?: PrintTemplateConfig;
  onSubmit: (dto: CreatePrintTemplateDto) => Promise<void>;
  isSubmitting?: boolean;
  title: string;
  subtitle: string;
}

const PRESET_SIZES = [
  { label: '58 × 40 мм', w: 58, h: 40 },
  { label: '40 × 30 мм', w: 40, h: 30 },
  { label: '58 × 30 мм', w: 58, h: 30 },
  { label: '80 × 60 мм', w: 80, h: 60 },
];

export function TemplateEditorForm({
  initialName = 'Новый шаблон ценника',
  initialWidthMm = 58,
  initialHeightMm = 40,
  initialIsDefault = false,
  initialConfig,
  onSubmit,
  isSubmitting = false,
  title,
  subtitle,
}: TemplateEditorFormProps) {
  const [activeTab, setActiveTab] = useState<'elements' | 'presets' | 'geometry' | 'printer'>('elements');

  const [name, setName] = useState(initialName);
  const [widthMm, setWidthMm] = useState<number>(initialWidthMm);
  const [heightMm, setHeightMm] = useState<number>(initialHeightMm);
  const [isDefault, setIsDefault] = useState<boolean>(initialIsDefault);

  // Initialize elements from config or defaults
  const [elements, setElements] = useState<LabelElement[]>(() =>
    getTemplateElements(initialConfig)
  );

  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    elements[0]?.id || null
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [showTsplModal, setShowTsplModal] = useState(false);

  // High-level config state (printer params, borders)
  const [config, setConfig] = useState<PrintTemplateConfig>(() => ({
    ...initialConfig,
    elements: getTemplateElements(initialConfig),
    showBorder: initialConfig?.showBorder ?? false,
    borderWidth: initialConfig?.borderWidth ?? 1,
    density: initialConfig?.density ?? 8,
    speed: initialConfig?.speed ?? 4,
    gapMm: initialConfig?.gapMm ?? 2,
    direction: initialConfig?.direction ?? 0,
  }));

  // Selected element reference
  const selectedElement = elements.find((el) => el.id === selectedElementId) || null;

  // Helper to update elements and keep config synchronized
  const updateElements = (newElements: LabelElement[]) => {
    setElements(newElements);
    setConfig((prev) => syncConfigWithElements(newElements, prev));
  };

  // Reorder element up or down
  const handleReorder = (id: string, direction: 'up' | 'down') => {
    const sorted = [...elements].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex((e) => e.id === id);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      const prev = sorted[index - 1];
      const curr = sorted[index];
      const tempOrder = prev.order;
      prev.order = curr.order;
      curr.order = tempOrder;
      updateElements([...sorted]);
    } else if (direction === 'down' && index < sorted.length - 1) {
      const next = sorted[index + 1];
      const curr = sorted[index];
      const tempOrder = next.order;
      next.order = curr.order;
      curr.order = tempOrder;
      updateElements([...sorted]);
    }
  };

  // Toggle visibility of element (Hide / Show)
  const handleToggleVisibility = (id: string) => {
    const updated = elements.map((el) => {
      if (el.id === id) {
        return { ...el, visible: !el.visible };
      }
      return el;
    });
    updateElements(updated);
  };

  // Move element on canvas (X and Y offsets)
  const handleMoveElement = (id: string, deltaX: number, deltaY: number) => {
    const updated = elements.map((el) => {
      if (el.id === id) {
        return {
          ...el,
          offsetX: Math.max(-50, Math.min(50, (el.offsetX || 0) + deltaX)),
          offsetY: Math.max(-50, Math.min(50, (el.offsetY || 0) + deltaY)),
        };
      }
      return el;
    });
    updateElements(updated);
  };

  // Update specific property of selected element
  const handleUpdateSelected = <K extends keyof LabelElement>(key: K, value: LabelElement[K]) => {
    if (!selectedElementId) return;
    const updated = elements.map((el) => {
      if (el.id === selectedElementId) {
        return { ...el, [key]: value };
      }
      return el;
    });
    updateElements(updated);
  };

  // Add new element from catalog
  const handleAddElement = (type: LabelElementType) => {
    const preset = ELEMENT_PRESET_CATALOG.find((p) => p.type === type);
    const maxOrder = elements.length > 0 ? Math.max(...elements.map((e) => e.order)) : 0;

    const newId = `el-${type}-${Date.now().toString().slice(-5)}`;
    const newElement: LabelElement = {
      id: newId,
      type,
      label: preset?.label || 'Новый элемент',
      visible: true,
      order: maxOrder + 1,
      offsetX: 0,
      offsetY: 0,
      ...preset?.defaultConfig,
    };

    const newElements = [...elements, newElement];
    updateElements(newElements);
    setSelectedElementId(newId);
    setShowAddModal(false);
    toast.success(`Элемент «${newElement.label}» добавлен на ценник`);
  };

  // Duplicate an existing element
  const handleDuplicateElement = (id: string) => {
    const target = elements.find((e) => e.id === id);
    if (!target) return;

    const maxOrder = Math.max(...elements.map((e) => e.order));
    const newId = `el-${target.type}-${Date.now().toString().slice(-5)}`;
    const duplicated: LabelElement = {
      ...target,
      id: newId,
      label: `${target.label} (Копия)`,
      order: maxOrder + 1,
      offsetY: (target.offsetY || 0) + 4,
    };

    updateElements([...elements, duplicated]);
    setSelectedElementId(newId);
    toast.success(`Элемент продублирован`);
  };

  // Delete element
  const handleDeleteElement = (id: string) => {
    if (elements.length <= 1) {
      toast.warning('На ценнике должен оставаться хотя бы один элемент');
      return;
    }

    const updated = elements.filter((e) => e.id !== id);
    updateElements(updated);
    if (selectedElementId === id) {
      setSelectedElementId(updated[0]?.id || null);
    }
    toast.info('Элемент удален');
  };

  // Reset elements to standard layout
  const handleResetToDefault = () => {
    const standard = getDefaultElements(config);
    updateElements(standard);
    setSelectedElementId(standard[0]?.id || null);
    toast.info('Макет сброшен к стандартному виду');
  };

  // Apply a layout preset
  const handleApplyPreset = (presetId: string) => {
    const preset = LAYOUT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    const newEls = preset.elements(config);
    updateElements(newEls);
    setSelectedElementId(newEls[0]?.id || null);
    setActiveTab('elements');
    toast.success(`Применен макет «${preset.name}»`);
  };

  // Update root config
  const handleConfigChange = <K extends keyof PrintTemplateConfig>(
    key: K,
    value: PrintTemplateConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const applyPresetSize = (w: number, h: number) => {
    setWidthMm(w);
    setHeightMm(h);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalConfig = syncConfigWithElements(elements, config);
    await onSubmit({
      name: name.trim(),
      widthMm: Number(widthMm),
      heightMm: Number(heightMm),
      isDefault,
      config: finalConfig,
    });
  };

  // Icon selector by element type
  const getElementIcon = (type: LabelElementType) => {
    switch (type) {
      case 'storeName':
        return <Tag className="w-3.5 h-3.5 text-blue-600" />;
      case 'productName':
        return <Type className="w-3.5 h-3.5 text-slate-700" />;
      case 'price':
        return <Percent className="w-3.5 h-3.5 text-emerald-600" />;
      case 'oldPrice':
        return <Percent className="w-3.5 h-3.5 text-slate-400" />;
      case 'discountBadge':
        return <Sparkles className="w-3.5 h-3.5 text-amber-500" />;
      case 'barcode':
        return <Barcode className="w-3.5 h-3.5 text-purple-600" />;
      case 'qrcode':
        return <QrCode className="w-3.5 h-3.5 text-indigo-600" />;
      case 'country':
        return <Globe className="w-3.5 h-3.5 text-teal-600" />;
      case 'divider':
        return <Split className="w-3.5 h-3.5 text-slate-500" />;
      default:
        return <Type className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/templates">
            <Button type="button" variant="outline" size="sm">
              Назад к списку
            </Button>
          </Link>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm font-semibold"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Сохранение...' : 'Сохранить шаблон'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Editor Form Columns (Left) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('elements')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap',
                activeTab === 'elements'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              Конструктор элементов
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap',
                activeTab === 'presets'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Готовые макеты
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('geometry')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap',
                activeTab === 'geometry'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Размеры и рамка
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('printer')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap',
                activeTab === 'printer'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Printer className="w-3.5 h-3.5" />
              Принтер (TSPL)
            </button>
          </div>

          {/* TAB 1: Конструктор элементов (Layers & Inspector) */}
          {activeTab === 'elements' && (
            <div className="space-y-4">
              {/* Layers Action Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600" />
                    Слои ценника ({elements.length})
                  </span>
                  <span className="text-[11px] text-slate-400">
                    • {elements.filter((e) => e.visible).length} активных
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResetToDefault}
                    className="h-8 text-xs text-slate-600 gap-1.5 hover:bg-slate-50"
                    title="Сбросить все элементы к стандартным"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    Сброс
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setShowAddModal(true)}
                    className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-2xs font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Добавить элемент
                  </Button>
                </div>
              </div>

              {/* Elements List (Layers) */}
              <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                <CardHeader className="p-3.5 bg-slate-50/80 border-b border-slate-100 flex flex-row items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">
                    Порядок элементов сверху вниз (перемещайте стрелками ⬆ ⬇ или тяните мышкой на превью)
                  </span>
                </CardHeader>
                <CardContent className="p-0 divide-y divide-slate-100 max-h-[310px] overflow-y-auto">
                  {[...elements]
                    .sort((a, b) => a.order - b.order)
                    .map((el, idx, arr) => {
                      const isSelected = el.id === selectedElementId;
                      return (
                        <div
                          key={el.id}
                          onClick={() => setSelectedElementId(el.id)}
                          className={cn(
                            'p-2.5 flex items-center justify-between gap-2 cursor-pointer transition-all',
                            isSelected
                              ? 'bg-blue-50/70 border-l-4 border-blue-600 pl-2'
                              : 'hover:bg-slate-50/80 border-l-4 border-transparent'
                          )}
                        >
                          {/* Element details */}
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-slate-400 p-0.5">
                              {getElementIcon(el.type)}
                            </span>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={cn(
                                    'text-xs font-semibold truncate',
                                    el.visible ? 'text-slate-900' : 'text-slate-400 line-through'
                                  )}
                                >
                                  {el.label}
                                </span>
                                {!el.visible && (
                                  <span className="text-[10px] bg-slate-200 text-slate-600 px-1 rounded">
                                    Скрыт
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 truncate max-w-[200px] font-mono">
                                {el.content || (el.type === 'price' ? '12 000 сум' : el.type === 'barcode' ? '4780111550194' : el.type)}
                              </p>
                            </div>
                          </div>

                          {/* Quick Controls: Move Up/Down, Visibility, Duplicate, Delete */}
                          <div
                            className="flex items-center gap-1 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleReorder(el.id, 'up')}
                              className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-400 rounded transition"
                              title="Переместить выше"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === arr.length - 1}
                              onClick={() => handleReorder(el.id, 'down')}
                              className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-400 rounded transition"
                              title="Переместить ниже"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleVisibility(el.id)}
                              className={cn(
                                'p-1 rounded transition ml-1',
                                el.visible
                                  ? 'text-blue-600 hover:bg-blue-100/60'
                                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                              )}
                              title={el.visible ? 'Скрыть с ценника' : 'Показать на ценнике'}
                            >
                              {el.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDuplicateElement(el.id)}
                              className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition"
                              title="Дублировать элемент"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteElement(el.id)}
                              className="p-1 text-red-400 hover:text-red-700 hover:bg-red-50 rounded transition"
                              title="Удалить элемент"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </CardContent>
              </Card>

              {/* Inspector Panel for Selected Element */}
              {selectedElement && (
                <Card className="border-blue-200/80 shadow-sm bg-white ring-1 ring-blue-100">
                  <CardHeader className="p-4 pb-3 bg-blue-50/40 border-b border-blue-100 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                        {getElementIcon(selectedElement.type)}
                      </div>
                      <div>
                        <CardTitle className="text-sm font-bold text-slate-900">
                          {selectedElement.label}
                        </CardTitle>
                        <CardDescription className="text-[11px]">
                          Параметры шрифта, текста, выравнивания и точного смещения
                        </CardDescription>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-600">Видимость:</span>
                      <Switch
                        checked={selectedElement.visible}
                        onCheckedChange={(val) => handleUpdateSelected('visible', val)}
                      />
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 space-y-4">
                    {/* Rename element label */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-700">
                          Название слоя:
                        </label>
                        <Input
                          type="text"
                          value={selectedElement.label}
                          onChange={(e) => handleUpdateSelected('label', e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>

                      {/* Content (if text, storeName, discount, country, etc.) */}
                      {selectedElement.type !== 'barcode' && selectedElement.type !== 'divider' && (
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-700">
                            Текст содержимого:
                          </label>
                          <Input
                            type="text"
                            value={selectedElement.content || ''}
                            onChange={(e) => handleUpdateSelected('content', e.target.value)}
                            placeholder={selectedElement.type === 'productName' ? 'Из базы товара' : 'Текст'}
                            className="h-8 text-xs"
                          />
                        </div>
                      )}
                    </div>

                    {/* Prefix & Suffix (if relevant) */}
                    {(selectedElement.type === 'oldPrice' ||
                      selectedElement.type === 'productCode' ||
                      selectedElement.type === 'country' ||
                      selectedElement.type === 'date' ||
                      selectedElement.type === 'customText') && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-700">
                            Префикс (перед текстом):
                          </label>
                          <Input
                            type="text"
                            value={selectedElement.prefix || ''}
                            onChange={(e) => handleUpdateSelected('prefix', e.target.value)}
                            placeholder="Напр. «Арт: », «Дата: »"
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-700">
                            Суффикс (после текста):
                          </label>
                          <Input
                            type="text"
                            value={selectedElement.suffix || ''}
                            onChange={(e) => handleUpdateSelected('suffix', e.target.value)}
                            placeholder="Напр. « сум», « шт.»"
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {/* Typography controls: Font Size & Alignment */}
                    {selectedElement.type !== 'divider' && (
                      <div className="grid grid-cols-2 gap-4 pt-1 border-t border-slate-100">
                        {/* Font Size */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="font-semibold text-slate-700">
                              Размер шрифта ({selectedElement.fontSize || 10} pt):
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="6"
                              max="48"
                              value={selectedElement.fontSize || 10}
                              onChange={(e) => handleUpdateSelected('fontSize', Number(e.target.value))}
                              className="w-full accent-blue-600"
                            />
                            <Input
                              type="number"
                              min="6"
                              max="48"
                              value={selectedElement.fontSize || 10}
                              onChange={(e) => handleUpdateSelected('fontSize', Number(e.target.value))}
                              className="h-7 w-14 text-xs font-mono text-center px-1"
                            />
                          </div>
                        </div>

                        {/* Alignment Buttons */}
                        <div className="space-y-1">
                          <span className="text-[11px] font-semibold text-slate-700 block">
                            Выравнивание:
                          </span>
                          <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                            <button
                              type="button"
                              onClick={() => handleUpdateSelected('textAlign', 'left')}
                              className={cn(
                                'flex-1 py-1 flex items-center justify-center rounded transition',
                                selectedElement.textAlign === 'left' || !selectedElement.textAlign
                                  ? 'bg-white shadow-xs text-blue-700 font-bold'
                                  : 'text-slate-500 hover:text-slate-900'
                              )}
                              title="По левому краю"
                            >
                              <AlignLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateSelected('textAlign', 'center')}
                              className={cn(
                                'flex-1 py-1 flex items-center justify-center rounded transition',
                                selectedElement.textAlign === 'center'
                                  ? 'bg-white shadow-xs text-blue-700 font-bold'
                                  : 'text-slate-500 hover:text-slate-900'
                              )}
                              title="По центру"
                            >
                              <AlignCenter className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateSelected('textAlign', 'right')}
                              className={cn(
                                'flex-1 py-1 flex items-center justify-center rounded transition',
                                selectedElement.textAlign === 'right'
                                  ? 'bg-white shadow-xs text-blue-700 font-bold'
                                  : 'text-slate-500 hover:text-slate-900'
                              )}
                              title="По правому краю"
                            >
                              <AlignRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Weight & Style Pills */}
                    {selectedElement.type !== 'divider' && selectedElement.type !== 'barcode' && selectedElement.type !== 'qrcode' && (
                      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
                        <span className="text-[11px] font-semibold text-slate-600 mr-1">Стиль:</span>

                        {/* Font weight */}
                        {(['normal', 'bold', 'black'] as const).map((w) => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => handleUpdateSelected('fontWeight', w)}
                            className={cn(
                              'px-2 py-0.5 text-[11px] rounded-md border transition capitalize',
                              selectedElement.fontWeight === w
                                ? 'bg-blue-600 text-white border-blue-600 font-bold'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            )}
                          >
                            {w === 'normal' ? 'Обычный' : w === 'bold' ? 'Жирный' : 'Black'}
                          </button>
                        ))}

                        {/* Uppercase toggle */}
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateSelected(
                              'textTransform',
                              selectedElement.textTransform === 'uppercase' ? 'none' : 'uppercase'
                            )
                          }
                          className={cn(
                            'px-2 py-0.5 text-[11px] rounded-md border transition font-mono',
                            selectedElement.textTransform === 'uppercase'
                              ? 'bg-blue-600 text-white border-blue-600 font-bold'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          )}
                        >
                          AA (ЗАГЛАВНЫЕ)
                        </button>

                        {/* Inverted toggle (white on black badge) */}
                        <button
                          type="button"
                          onClick={() => handleUpdateSelected('inverted', !selectedElement.inverted)}
                          className={cn(
                            'px-2 py-0.5 text-[11px] rounded-md border transition',
                            selectedElement.inverted
                              ? 'bg-black text-white border-black font-bold'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          )}
                        >
                          {selectedElement.inverted ? '■ Инверсия (Ч/Б)' : '□ Обычный фон'}
                        </button>

                        {/* Bottom border line */}
                        <button
                          type="button"
                          onClick={() => handleUpdateSelected('borderBottom', !selectedElement.borderBottom)}
                          className={cn(
                            'px-2 py-0.5 text-[11px] rounded-md border transition',
                            selectedElement.borderBottom
                              ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          )}
                        >
                          Линия снизу
                        </button>
                      </div>
                    )}

                    {/* Specific Barcode Settings */}
                    {selectedElement.type === 'barcode' && (
                      <div className="space-y-3 pt-2 border-t border-slate-100">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-700">
                              Тип штрихкода:
                            </label>
                            <select
                              value={selectedElement.barcodeType || '128'}
                              onChange={(e) =>
                                handleUpdateSelected('barcodeType', e.target.value as '128' | 'EAN13')
                              }
                              className="w-full h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs"
                            >
                              <option value="128">CODE 128 (Универсальный)</option>
                              <option value="EAN13">EAN-13 (13 цифр)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-700">
                              Высота штрихов ({selectedElement.barcodeHeight || 45} pt):
                            </label>
                            <input
                              type="range"
                              min="20"
                              max="70"
                              value={selectedElement.barcodeHeight || 45}
                              onChange={(e) =>
                                handleUpdateSelected('barcodeHeight', Number(e.target.value))
                              }
                              className="w-full accent-blue-600 mt-2"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between py-1">
                          <span className="text-xs text-slate-700">
                            Печатать читаемые цифры под штрихкодом
                          </span>
                          <Switch
                            checked={selectedElement.showBarcodeDigits !== false}
                            onCheckedChange={(val) => handleUpdateSelected('showBarcodeDigits', val)}
                          />
                        </div>
                      </div>
                    )}

                    {/* Specific QR Settings */}
                    {selectedElement.type === 'qrcode' && (
                      <div className="space-y-3 pt-2 border-t border-slate-100">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-700">
                            Размер QR ({selectedElement.qrSize || 36} px):
                          </label>
                          <input
                            type="range"
                            min="24"
                            max="60"
                            value={selectedElement.qrSize || 36}
                            onChange={(e) => handleUpdateSelected('qrSize', Number(e.target.value))}
                            className="w-full accent-blue-600"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-700">
                            Ссылка или данные для QR:
                          </label>
                          <Input
                            type="text"
                            value={selectedElement.qrData || ''}
                            onChange={(e) => handleUpdateSelected('qrData', e.target.value)}
                            placeholder="https://..."
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {/* Specific Price Settings */}
                    {selectedElement.type === 'price' && (
                      <div className="space-y-3 pt-2 border-t border-slate-100">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-700">
                              Валюта ценника:
                            </label>
                            <Input
                              type="text"
                              value={selectedElement.currencySymbol || 'сум'}
                              onChange={(e) => handleUpdateSelected('currencySymbol', e.target.value)}
                              placeholder="сум"
                              className="h-8 text-xs font-bold"
                            />
                          </div>

                          <div className="flex items-center justify-between pt-4">
                            <span className="text-xs text-slate-700">
                              Выводить «за шт./кг»:
                            </span>
                            <Switch
                              checked={selectedElement.showMeasure !== false}
                              onCheckedChange={(val) => handleUpdateSelected('showMeasure', val)}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Precise Positioning & Offset Section (Move elements) */}
                    <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Move className="w-3.5 h-3.5 text-blue-600" />
                          Точное позиционирование и смещение (X / Y)
                        </span>

                        {(selectedElement.offsetX || selectedElement.offsetY) && (
                          <button
                            type="button"
                            onClick={() => {
                              handleUpdateSelected('offsetX', 0);
                              handleUpdateSelected('offsetY', 0);
                            }}
                            className="text-[11px] text-blue-600 hover:underline font-semibold"
                          >
                            Сбросить в 0
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Offset Y */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-600 font-medium">
                              Смещение Y ({selectedElement.offsetY || 0} px):
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="-25"
                              max="35"
                              value={selectedElement.offsetY || 0}
                              onChange={(e) => handleUpdateSelected('offsetY', Number(e.target.value))}
                              className="w-full accent-blue-600"
                            />
                            <span className="font-mono text-xs w-9 text-right font-bold text-slate-700">
                              {selectedElement.offsetY || 0}px
                            </span>
                          </div>
                        </div>

                        {/* Offset X */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-600 font-medium">
                              Смещение X ({selectedElement.offsetX || 0} px):
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="-30"
                              max="30"
                              value={selectedElement.offsetX || 0}
                              onChange={(e) => handleUpdateSelected('offsetX', Number(e.target.value))}
                              className="w-full accent-blue-600"
                            />
                            <span className="font-mono text-xs w-9 text-right font-bold text-slate-700">
                              {selectedElement.offsetX || 0}px
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        💡 Подсказка: Вы также можете перетаскивать элемент мышкой прямо на интерактивном превью справа!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* TAB 2: Готовые макеты (Presets) */}
          {activeTab === 'presets' && (
            <Card className="border-slate-200 shadow-sm bg-white">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Готовые стили и шаблоны макетов
                </CardTitle>
                <CardDescription className="text-xs">
                  Выберите подходящий стиль ценника в 1 клик. Все элементы можно будет дополнительно настроить
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {LAYOUT_PRESETS.map((preset) => (
                    <div
                      key={preset.id}
                      className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 transition-all flex flex-col justify-between space-y-3 group"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition">
                            {preset.name}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {preset.description}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleApplyPreset(preset.id)}
                        className="w-full text-xs font-semibold bg-white hover:bg-blue-600 hover:text-white transition"
                      >
                        Применить этот макет
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 3: Размеры и геометрия */}
          {activeTab === 'geometry' && (
            <Card className="border-slate-200 shadow-sm bg-white">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Maximize2 className="w-4 h-4 text-blue-600" />
                  Геометрия и стиль ценника
                </CardTitle>
                <CardDescription className="text-xs">
                  Физические размеры термоэтикетки и декоративные границы
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Название шаблона
                  </label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Например: Стандартный 58х40мм"
                    required
                  />
                </div>

                {/* Size presets */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Быстрый выбор стандартного размера:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_SIZES.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => applyPresetSize(preset.w, preset.h)}
                        className={cn(
                          'px-2.5 py-1 text-xs font-mono font-medium rounded-md border transition',
                          widthMm === preset.w && heightMm === preset.h
                            ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        )}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Ширина (мм)
                    </label>
                    <Input
                      type="number"
                      min="20"
                      max="120"
                      value={widthMm}
                      onChange={(e) => setWidthMm(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Высота (мм)
                    </label>
                    <Input
                      type="number"
                      min="15"
                      max="120"
                      value={heightMm}
                      onChange={(e) => setHeightMm(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                {/* Border toggle */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Рамка по периметру
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Рисовать черную рамку по краю ценника
                      </span>
                    </div>
                    <Switch
                      checked={config.showBorder ?? false}
                      onCheckedChange={(val) => handleConfigChange('showBorder', val)}
                    />
                  </div>

                  {config.showBorder && (
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-xs text-slate-600">Толщина линии рамки:</span>
                      <div className="flex gap-1.5">
                        {[1, 2, 3].map((w) => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => handleConfigChange('borderWidth', w)}
                            className={cn(
                              'w-7 h-7 text-xs font-bold rounded border',
                              config.borderWidth === w
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-slate-700 border-slate-300'
                            )}
                          >
                            {w}px
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Default template toggle */}
                <div className="pt-2 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-slate-900 block">
                      Сделать основным шаблоном
                    </span>
                    <span className="text-xs text-slate-500">
                      Автоматически выбирать для всех новых сессий печати
                    </span>
                  </div>
                  <Switch checked={isDefault} onCheckedChange={setIsDefault} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 4: Параметры TSPL принтера */}
          {activeTab === 'printer' && (
            <Card className="border-slate-200 shadow-sm bg-white">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Printer className="w-4 h-4 text-amber-600" />
                  Параметры термопечати (TSPL)
                </CardTitle>
                <CardDescription className="text-xs">
                  Низкоуровневые команды для Xprinter, TSC и совместимых принтеров
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-4">
                {/* Density (Плотность / яркость) */}
                <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900">
                      Плотность термоголовки (DENSITY):
                    </span>
                    <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-blue-700">
                      {config.density ?? 8} из 15
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={config.density ?? 8}
                    onChange={(e) => handleConfigChange('density', Number(e.target.value))}
                    className="w-full accent-blue-600 mt-2"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>1 (Светлее)</span>
                    <span>8 (Стандарт)</span>
                    <span>15 (Макс. чернота)</span>
                  </div>
                </div>

                {/* Speed (Скорость) */}
                <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900">
                      Скорость протяжки (SPEED):
                    </span>
                    <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-blue-700">
                      {config.speed ?? 4} дюйм/сек
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[2, 3, 4, 5, 6].map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => handleConfigChange('speed', spd)}
                        className={cn(
                          'flex-1 py-1.5 text-xs font-bold rounded-lg border transition',
                          config.speed === spd
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        )}
                      >
                        {spd}&quot;
                      </button>
                    ))}
                  </div>
                </div>

                {/* Label Gap & Print Direction */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Зазор между этикетками (GAP мм)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={config.gapMm ?? 2}
                      onChange={(e) => handleConfigChange('gapMm', Number(e.target.value))}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Направление (DIRECTION)
                    </label>
                    <button
                      type="button"
                      onClick={() => handleConfigChange('direction', config.direction === 1 ? 0 : 1)}
                      className={cn(
                        'w-full h-9 flex items-center justify-center gap-1.5 rounded-lg border text-xs font-semibold transition',
                        config.direction === 1
                          ? 'bg-amber-50 border-amber-300 text-amber-800'
                          : 'bg-white border-slate-300 text-slate-700'
                      )}
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      {config.direction === 1 ? 'Поворот 180°' : '0° Прямое'}
                    </button>
                  </div>
                </div>

                {/* TSPL Live Preview endpoint card */}
                <div className="p-3.5 bg-slate-900 text-slate-100 rounded-xl border border-slate-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-blue-400" />
                      Сгенерированные команды TSPL
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTsplModal(true)}
                      className="h-7 text-[11px] bg-slate-800 border-slate-700 hover:bg-slate-700 text-white font-medium gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Посмотреть TSPL (9100)
                    </Button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Сервис термопечати на порту 9100 генерирует чистые TSPL инструкции для принтера. Вы можете просмотреть или скачать их в реальном времени.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Live Preview Sticky Sidebar (Right) */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
            <CardHeader className="p-4 bg-slate-50 border-b border-slate-200 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Move className="w-4 h-4 text-blue-600" />
                  Интерактивный холст
                </CardTitle>
                <CardDescription className="text-xs">
                  Кликните на элемент для выбора или перетащите для смещения
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="label-preview-container min-h-[300px] flex items-center justify-center">
                <LabelLivePreview
                  widthMm={widthMm}
                  heightMm={heightMm}
                  config={config}
                  elements={elements}
                  selectedElementId={selectedElementId}
                  onSelectElement={setSelectedElementId}
                  onMoveElement={handleMoveElement}
                  onReorderElement={handleReorder}
                  onToggleElementVisibility={handleToggleVisibility}
                  onDeleteElement={handleDeleteElement}
                  isInteractive={true}
                />
              </div>

              {/* Status summary list */}
              <div className="mt-4 p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-slate-700 space-y-1.5">
                <div className="font-bold text-blue-900 flex items-center justify-between">
                  <span>Сводка макета:</span>
                  <span className="font-mono text-blue-600">{widthMm} × {heightMm} мм</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Всего слоев:</span>
                  <strong className="text-slate-900">
                    {elements.length} ({elements.filter((e) => e.visible).length} видимых)
                  </strong>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Выбранный элемент:</span>
                  <strong className="text-blue-700">
                    {selectedElement ? selectedElement.label : 'Ни один не выбран'}
                  </strong>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Рамка / Направление:</span>
                  <strong className="text-slate-900">
                    {config.showBorder ? `Рамка ${config.borderWidth || 1}px` : 'Без рамки'}
                    {config.direction === 1 ? ' • Поворот 180°' : ''}
                  </strong>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* MODAL: Добавить элемент на ценник */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-blue-600" />
                  Добавить новый элемент на ценник
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Выберите тип блока для добавления в шаблон
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            <div className="p-5 max-h-[460px] overflow-y-auto space-y-2.5">
              {ELEMENT_PRESET_CATALOG.map((item) => (
                <div
                  key={item.type}
                  onClick={() => handleAddElement(item.type)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-blue-600 group-hover:text-white transition">
                      {getElementIcon(item.type)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition">
                        {item.label}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition">
                    + Добавить
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddModal(false)}
              >
                Закрыть
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TSPL Live Preview Modal */}
      <TsplPreviewModal
        isOpen={showTsplModal}
        onClose={() => setShowTsplModal(false)}
      />
    </div>
  );
}
