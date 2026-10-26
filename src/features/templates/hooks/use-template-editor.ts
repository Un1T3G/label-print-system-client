'use client';

import { useState } from 'react';
import type {
  PrintTemplateConfig,
  CreatePrintTemplateDto,
  LabelElement,
  LabelElementType,
  TemplateViewMode,
} from '../types';
import {
  getTemplateElements,
  syncConfigWithElements,
  ELEMENT_PRESET_CATALOG,
  LAYOUT_PRESETS,
  getDefaultPieceElements,
  getDefaultWeightElements,
} from '../lib/label-elements';
import { toast } from 'sonner';

let elementIdCounter = 0;

export interface UseTemplateEditorParams {
  initialName?: string;
  initialWidthMm?: number;
  initialHeightMm?: number;
  initialIsDefault?: boolean;
  initialConfig?: PrintTemplateConfig;
  onSubmit: (dto: CreatePrintTemplateDto) => Promise<void>;
}

export type EditorTabType = 'elements' | 'presets' | 'geometry' | 'printer';

export function useTemplateEditor({
  initialName = 'Новый шаблон ценника',
  initialWidthMm = 58,
  initialHeightMm = 40,
  initialIsDefault = false,
  initialConfig,
  onSubmit,
}: UseTemplateEditorParams) {
  const [activeTab, setActiveTab] = useState<EditorTabType>('elements');

  const [name, setName] = useState(initialName);
  const [widthMm, setWidthMm] = useState<number>(initialWidthMm);
  const [heightMm, setHeightMm] = useState<number>(initialHeightMm);
  const [isDefault, setIsDefault] = useState<boolean>(initialIsDefault);

  // Двойной макет: штучный (шт) и весовой (кг) в одном шаблоне
  const [viewMode, setViewMode] = useState<TemplateViewMode>('piece');

  const [pieceElements, setPieceElements] = useState<LabelElement[]>(() =>
    getTemplateElements(initialConfig, 'piece')
  );

  const [weightElements, setWeightElements] = useState<LabelElement[]>(() =>
    getTemplateElements(initialConfig, 'weight')
  );

  // Текущий активный список элементов в зависимости от режима просмотра
  const elements = viewMode === 'piece' ? pieceElements : weightElements;

  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    elements[0]?.id || null
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [showTsplModal, setShowTsplModal] = useState(false);

  // High-level config state (printer params, borders)
  const [config, setConfig] = useState<PrintTemplateConfig>(() => ({
    ...initialConfig,
    pieceElements: getTemplateElements(initialConfig, 'piece'),
    weightElements: getTemplateElements(initialConfig, 'weight'),
    elements: getTemplateElements(initialConfig, 'piece'),
    showBorder: initialConfig?.showBorder ?? false,
    borderWidth: initialConfig?.borderWidth ?? 1,
    density: initialConfig?.density ?? 8,
    speed: initialConfig?.speed ?? 4,
    gapMm: initialConfig?.gapMm ?? 2,
    direction: initialConfig?.direction ?? 0,
  }));

  const selectedElement = elements.find((el) => el.id === selectedElementId) || null;

  const handleViewModeChange = (mode: TemplateViewMode) => {
    setViewMode(mode);
    const targetList = mode === 'piece' ? pieceElements : weightElements;
    setSelectedElementId(targetList[0]?.id || null);
  };

  const updateElements = (newElements: LabelElement[]) => {
    if (viewMode === 'piece') {
      setPieceElements(newElements);
    } else {
      setWeightElements(newElements);
    }

    setConfig((prev) => {
      const updatedPiece = viewMode === 'piece' ? newElements : pieceElements;
      const updatedWeight = viewMode === 'weight' ? newElements : weightElements;
      return {
        ...syncConfigWithElements(newElements, prev),
        pieceElements: updatedPiece,
        weightElements: updatedWeight,
        elements: updatedPiece, // backwards compatibility
      };
    });
  };

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

  const handleToggleVisibility = (id: string) => {
    const updated = elements.map((el) => {
      if (el.id === id) {
        return { ...el, visible: !el.visible };
      }
      return el;
    });
    updateElements(updated);
  };

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

  const handleAddElement = (type: LabelElementType) => {
    const preset = ELEMENT_PRESET_CATALOG.find((p) => p.type === type);
    const maxOrder = elements.length > 0 ? Math.max(...elements.map((e) => e.order)) : 0;

    const newId = `el-${type}-${++elementIdCounter}`;
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

  const handleDuplicateElement = (id: string) => {
    const target = elements.find((e) => e.id === id);
    if (!target) return;

    const maxOrder = Math.max(...elements.map((e) => e.order));
    const newId = `el-${target.type}-${++elementIdCounter}`;
    const duplicated: LabelElement = {
      ...target,
      id: newId,
      label: `${target.label} (Копия)`,
      order: maxOrder + 1,
      offsetY: (target.offsetY || 0) + 4,
    };

    updateElements([...elements, duplicated]);
    setSelectedElementId(newId);
    toast.success('Элемент продублирован');
  };

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

  const handleResetToDefault = () => {
    if (viewMode === 'piece') {
      const standard = getDefaultPieceElements(config);
      updateElements(standard);
      setSelectedElementId(standard[0]?.id || null);
      toast.info('Штучный макет сброшен к стандартному виду');
    } else {
      const standard = getDefaultWeightElements(config);
      updateElements(standard);
      setSelectedElementId(standard[0]?.id || null);
      toast.info('Весовой макет сброшен к стандартному виду');
    }
  };

  const handleCopyFromOtherMode = () => {
    if (viewMode === 'weight') {
      const cloned = JSON.parse(JSON.stringify(pieceElements)) as LabelElement[];
      setWeightElements(cloned);
      setSelectedElementId(cloned[0]?.id || null);
      toast.success('Штучный макет скопирован в весовой вид');
    } else {
      const cloned = JSON.parse(JSON.stringify(weightElements)) as LabelElement[];
      setPieceElements(cloned);
      setSelectedElementId(cloned[0]?.id || null);
      toast.success('Весовой макет скопирован в штучный вид');
    }
  };

  const handleApplyPreset = (presetId: string) => {
    const preset = LAYOUT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    const newEls = preset.elements(config);
    updateElements(newEls);
    setSelectedElementId(newEls[0]?.id || null);
    setActiveTab('elements');
    toast.success(`Применен макет «${preset.name}»`);
  };

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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const currentSync = syncConfigWithElements(elements, config);
    const finalConfig: PrintTemplateConfig = {
      ...currentSync,
      pieceElements,
      weightElements,
      elements: pieceElements,
      targetType: 'all',
    };
    await onSubmit({
      name: name.trim(),
      widthMm: Number(widthMm),
      heightMm: Number(heightMm),
      isDefault,
      config: finalConfig,
    });
  };

  return {
    activeTab,
    setActiveTab,
    viewMode,
    setViewMode: handleViewModeChange,
    pieceElements,
    weightElements,
    name,
    setName,
    widthMm,
    setWidthMm,
    heightMm,
    setHeightMm,
    isDefault,
    setIsDefault,
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
  };
}
