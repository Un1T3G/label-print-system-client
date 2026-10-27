'use client';

import React from 'react';
import type { PrintTemplateConfig, CreatePrintTemplateDto } from '../types';
import { useTemplateEditor } from '../hooks/use-template-editor';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui';
import { TsplPreviewModal } from '@/features/print';
import { LabelLivePreview } from './LabelLivePreview';
import { Move, Tag, Scale, Sparkles } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import {
  EditorHeader,
  EditorTabsNav,
  ElementListCard,
  ElementInspector,
  PresetsTab,
  GeometryTab,
  PrinterTab,
  AddElementModal,
} from './editor';

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
  const {
    activeTab,
    setActiveTab,
    viewMode,
    setViewMode,
    name,
    setName,
    widthMm,
    setWidthMm,
    heightMm,
    setHeightMm,
    elements,
    selectedElementId,
    setSelectedElementId,
    selectedElement,
    showAddModal,
    setShowAddModal,
    showTsplModal,
    setShowTsplModal,
    config,
    handleReorder,
    handleToggleVisibility,
    handleMoveElement,
    handleSetElementOffset,
    handleAlignElement,
    handleUpdateSelected,
    handleAddElement,
    handleDuplicateElement,
    handleDeleteElement,
    handleResetToDefault,
    handleCopyFromOtherMode,
    handleApplyPreset,
    handleConfigChange,
    applyPresetSize,
    handleSubmit,
  } = useTemplateEditor({
    initialName,
    initialWidthMm,
    initialHeightMm,
    initialIsDefault,
    initialConfig,
    onSubmit,
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <EditorHeader
        title={title}
        subtitle={subtitle}
        isSubmitting={isSubmitting}
        onSave={() => handleSubmit()}
      />

      {/* Switcher: Штучный вид (шт) vs Весовой вид (кг) в одном шаблоне */}
      <div className="bg-card rounded-2xl border border-border p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold text-muted-foreground shrink-0">
            Редактируемый вид:
          </span>
          <div className="inline-flex p-1 bg-muted rounded-xl border border-border/70">
            <button
              type="button"
              onClick={() => setViewMode('piece')}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                viewMode === 'piece'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Tag className="size-3.5" />
              Штучные товары (шт)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('weight')}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                viewMode === 'weight'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Scale className="size-3.5" />
              Весовые товары (кг)
            </button>
          </div>
        </div>

        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 bg-muted/60 px-3 py-1.5 rounded-lg border border-border/50">
          <Sparkles className="size-3.5 text-amber-500 shrink-0" />
          <span>
            {viewMode === 'piece'
              ? 'Вид со штрихкодом и ценой за шт. Применяется к штучным товарам.'
              : 'Вид с крупным PLU-кодом весов и ценой за кг. Применяется к весовым товарам.'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Editor Form Columns (Left) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Navigation Tabs */}
          <EditorTabsNav activeTab={activeTab} onTabChange={setActiveTab} />

          {/* TAB 1: Конструктор элементов (Layers & Inspector) */}
          {activeTab === 'elements' && (
            <div className="flex flex-col gap-4">
              <ElementListCard
                elements={elements}
                selectedElementId={selectedElementId}
                onSelectElement={setSelectedElementId}
                onOpenAddModal={() => setShowAddModal(true)}
                onResetToDefault={handleResetToDefault}
                onReorder={handleReorder}
                onToggleVisibility={handleToggleVisibility}
                onDuplicate={handleDuplicateElement}
                onDelete={handleDeleteElement}
                viewMode={viewMode}
                onCopyFromOtherMode={handleCopyFromOtherMode}
              />

              {selectedElement && (
                <ElementInspector
                  selectedElement={selectedElement}
                  onUpdateSelected={handleUpdateSelected}
                />
              )}
            </div>
          )}

          {/* TAB 2: Готовые макеты (Presets) */}
          {activeTab === 'presets' && (
            <PresetsTab onApplyPreset={handleApplyPreset} />
          )}

          {/* TAB 3: Размеры и геометрия */}
          {activeTab === 'geometry' && (
            <GeometryTab
              name={name}
              onNameChange={setName}
              widthMm={widthMm}
              onWidthMmChange={setWidthMm}
              heightMm={heightMm}
              onHeightMmChange={setHeightMm}
              config={config}
              onConfigChange={handleConfigChange}
              onApplyPresetSize={applyPresetSize}
            />
          )}

          {/* TAB 4: Настройки термопринтера (TSPL) */}
          {activeTab === 'printer' && (
            <PrinterTab
              config={config}
              onConfigChange={handleConfigChange}
              onOpenTsplModal={() => setShowTsplModal(true)}
            />
          )}
        </div>

        {/* Live Preview Sticky Sidebar (Right) */}
        <div className="lg:col-span-5 sticky top-24 flex flex-col gap-4">
          <Card className="overflow-hidden">
            <CardHeader className="p-4 bg-muted/40 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Move className="size-4 text-primary" />
                  Интерактивный холст: {viewMode === 'weight' ? 'Весовой вид (кг)' : 'Штучный вид (шт)'}
                </CardTitle>
                <CardDescription className="text-xs">
                  Кликните на элемент для выбора или перетащите для смещения
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="label-preview-container min-h-[300px] flex items-center justify-center py-10 px-8">
                <LabelLivePreview
                  widthMm={widthMm}
                  heightMm={heightMm}
                  config={config}
                  elements={elements}
                  selectedElementId={selectedElementId}
                  onSelectElement={(id) => {
                    setSelectedElementId(id);
                    if (id && activeTab !== 'elements') {
                      setActiveTab('elements');
                    }
                  }}
                  onMoveElement={handleMoveElement}
                  onSetElementOffset={handleSetElementOffset}
                  onAlignElement={handleAlignElement}
                  onReorderElement={handleReorder}
                  onToggleElementVisibility={handleToggleVisibility}
                  onDeleteElement={handleDeleteElement}
                  isInteractive={true}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />
              </div>

              {/* Status summary list */}
              <div className="mt-4 p-3 bg-muted/50 rounded-xl border border-border text-xs flex flex-col gap-1.5 text-muted-foreground">
                <div className="font-semibold text-foreground flex items-center justify-between">
                  <span>Сводка макета:</span>
                  <span className="font-mono text-primary">{widthMm} × {heightMm} мм</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Текущий вид:</span>
                  <strong className={viewMode === 'weight' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}>
                    {viewMode === 'weight' ? '⚖️ Весовой (PLU)' : '🏷️ Штучный (Штрихкод)'}
                  </strong>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Слоев в виде:</span>
                  <strong className="text-foreground">
                    {elements.length} ({elements.filter((e) => e.visible).length} активных)
                  </strong>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Выбранный элемент:</span>
                  <strong className="text-primary">
                    {selectedElement ? selectedElement.label : 'Ни один не выбран'}
                  </strong>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Рамка / Направление:</span>
                  <strong className="text-foreground">
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
      <AddElementModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddElement={handleAddElement}
      />

      {/* TSPL Live Preview Dialog */}
      <TsplPreviewModal
        isOpen={showTsplModal}
        onClose={() => setShowTsplModal(false)}
      />
    </div>
  );
}
