'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { PrintTemplateConfig, LabelElement } from '../types';
import { getTemplateElements } from '../lib/label-elements';
import {
  Eye,
  ArrowUp,
  ArrowDown,
  Trash2,
  Move,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';
import { SAMPLE_PRODUCTS, type SampleProduct } from '../constants/sample-products';
import { LabelLiveElement, LabelPreviewToolbar } from './preview';

interface ActiveGuide {
  id: string;
  type: 'vertical-center' | 'horizontal-center' | 'element-x';
  pixelPos?: number;
  label: string;
  color: 'magenta' | 'cyan';
}

interface LabelLivePreviewProps {
  widthMm: number;
  heightMm: number;
  config: PrintTemplateConfig;
  elements?: LabelElement[];
  selectedElementId?: string | null;
  onSelectElement?: (id: string | null) => void;
  onMoveElement?: (id: string, deltaX: number, deltaY: number) => void;
  onSetElementOffset?: (id: string, offsetX: number, offsetY: number) => void;
  onAlignElement?: (id: string, align: 'left' | 'center' | 'right' | 'middle' | 'reset') => void;
  onReorderElement?: (id: string, direction: 'up' | 'down') => void;
  onToggleElementVisibility?: (id: string) => void;
  onDeleteElement?: (id: string) => void;
  product?: SampleProduct;
  showControls?: boolean;
  isInteractive?: boolean;
  viewMode?: 'piece' | 'weight';
  onViewModeChange?: (mode: 'piece' | 'weight') => void;
}

export function LabelLivePreview({
  widthMm,
  heightMm,
  config,
  elements: propsElements,
  selectedElementId = null,
  onSelectElement,
  onMoveElement,
  onSetElementOffset,
  onAlignElement,
  onReorderElement,
  onToggleElementVisibility,
  onDeleteElement,
  product,
  showControls = true,
  isInteractive = true,
  viewMode,
  onViewModeChange,
}: LabelLivePreviewProps) {
  const [zoom, setZoom] = useState(1);
  const [sampleIndex, setSampleIndex] = useState(() => (viewMode === 'weight' ? 2 : 0));
  const [smartGuides, setSmartGuides] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [activeGuides, setActiveGuides] = useState<ActiveGuide[]>([]);
  const [dragCoordinates, setDragCoordinates] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (viewMode === 'weight' && sampleIndex < 2) {
      setSampleIndex(2);
    } else if (viewMode === 'piece' && sampleIndex >= 2) {
      setSampleIndex(0);
    }
  }, [viewMode]);

  const handleSampleChange = (idx: number) => {
    setSampleIndex(idx);
    const selected = SAMPLE_PRODUCTS[idx];
    if (selected) {
      onViewModeChange?.(selected.isWeight ? 'weight' : 'piece');
    }
  };

  // Dragging state on canvas
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    initialOffsetX: number;
    initialOffsetY: number;
    elId: string;
  } | null>(null);

  const activeProduct = product || SAMPLE_PRODUCTS[sampleIndex];

  // Active elements list resolved based on weight vs piece
  const isWeight = Boolean(activeProduct?.isWeight ?? (viewMode === 'weight'));
  const activeElements = propsElements || getTemplateElements(config, isWeight);
  const sortedElements = [...activeElements].sort((a, b) => a.order - b.order);

  const currentDate = new Date().toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });

  const isRotated = config.direction === 1;

  // Handle direct mouse drag on canvas elements
  const handleMouseDown = (e: React.MouseEvent, elId: string) => {
    if (!isInteractive) return;
    e.stopPropagation();
    onSelectElement?.(elId);

    const target = sortedElements.find((item) => item.id === elId);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialOffsetX: target?.offsetX || 0,
      initialOffsetY: target?.offsetY || 0,
      elId,
    };
    setIsDragging(true);
    setDragCoordinates({
      x: target?.offsetX || 0,
      y: target?.offsetY || 0,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragStartRef.current) return;

      const rawDx = (e.clientX - dragStartRef.current.startX) / zoom;
      const rawDy = (e.clientY - dragStartRef.current.startY) / zoom;

      const dx = Math.round(isRotated ? -rawDx : rawDx);
      const dy = Math.round(isRotated ? -rawDy : rawDy);

      let targetOffsetX = dragStartRef.current.initialOffsetX + dx;
      let targetOffsetY = dragStartRef.current.initialOffsetY + dy;

      const guides: ActiveGuide[] = [];

      if (smartGuides) {
        const SNAP_THRESHOLD = 5;

        // Snapping 1: Center X (offsetX = 0)
        if (Math.abs(targetOffsetX) <= SNAP_THRESHOLD) {
          targetOffsetX = 0;
          guides.push({
            id: 'center-x',
            type: 'vertical-center',
            label: 'Центр X (0)',
            color: 'magenta',
          });
        }

        // Snapping 2: Base / Center line Y (offsetY = 0)
        if (Math.abs(targetOffsetY) <= SNAP_THRESHOLD) {
          targetOffsetY = 0;
          guides.push({
            id: 'center-y',
            type: 'horizontal-center',
            label: 'Базовая ось Y (0)',
            color: 'magenta',
          });
        }

        // Snapping 3: Align with another element's offsetX
        if (targetOffsetX !== 0) {
          const matchX = sortedElements.find(
            (other) =>
              other.id !== dragStartRef.current?.elId &&
              other.visible &&
              Math.abs(targetOffsetX - (other.offsetX || 0)) <= SNAP_THRESHOLD
          );
          if (matchX) {
            targetOffsetX = matchX.offsetX || 0;
            guides.push({
              id: `el-x-${matchX.id}`,
              type: 'element-x',
              pixelPos: targetOffsetX,
              label: `По оси «${matchX.label}» (${targetOffsetX > 0 ? `+${targetOffsetX}` : targetOffsetX}px)`,
              color: 'cyan',
            });
          }
        }
      }

      setActiveGuides(guides);
      setDragCoordinates({ x: targetOffsetX, y: targetOffsetY });

      if (onSetElementOffset) {
        onSetElementOffset(dragStartRef.current.elId, targetOffsetX, targetOffsetY);
      } else if (onMoveElement) {
        onMoveElement(dragStartRef.current.elId, dx, dy);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        dragStartRef.current = null;
        setActiveGuides([]);
        setDragCoordinates(null);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, zoom, isRotated, smartGuides, sortedElements, onSetElementOffset, onMoveElement]);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Interactive Controls Bar: Sample Switcher, Zoom, Smart Guides & Grid */}
      {showControls && (
        <LabelPreviewToolbar
          sampleIndex={sampleIndex}
          onSampleChange={handleSampleChange}
          zoom={zoom}
          onZoomIn={() => setZoom((z) => Math.min(2.0, +(z + 0.25).toFixed(2)))}
          onZoomOut={() => setZoom((z) => Math.max(0.75, +(z - 0.25).toFixed(2)))}
          onZoomReset={() => setZoom(1)}
          smartGuides={smartGuides}
          onToggleSmartGuides={() => setSmartGuides((prev) => !prev)}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid((prev) => !prev)}
        />
      )}

      {/* Label Canvas Container */}
      <div
        className="transition-transform duration-150 origin-top select-none relative"
        style={{
          transform: `scale(${zoom})`,
          marginBottom: zoom > 1 ? `${(zoom - 1) * 80}px` : undefined,
        }}
        onClick={() => isInteractive && onSelectElement?.(null)}
      >
        {/* Floating Live Coordinates HUD during drag */}
        {isDragging && dragCoordinates && (
          <div className="absolute -top-7.5 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold shadow-xl backdrop-blur-xs flex items-center gap-2 z-50 border border-slate-700 pointer-events-none animate-in fade-in duration-100">
            <span className={dragCoordinates.x === 0 ? 'text-rose-400 font-bold' : 'text-slate-200'}>
              X: {dragCoordinates.x > 0 ? `+${dragCoordinates.x}` : dragCoordinates.x}px
            </span>
            <span className="text-slate-600">•</span>
            <span className={dragCoordinates.y === 0 ? 'text-rose-400 font-bold' : 'text-slate-200'}>
              Y: {dragCoordinates.y > 0 ? `+${dragCoordinates.y}` : dragCoordinates.y}px
            </span>
            {activeGuides.length > 0 && (
              <span className="text-[9px] text-amber-300 font-sans font-bold flex items-center gap-0.5 ml-0.5">
                ⚡ ПРИМАГНИЧЕНО
              </span>
            )}
          </div>
        )}

        <div
          className={cn(
            'relative bg-white text-black rounded-xs shadow-md flex flex-col justify-between select-none box-border transition-all',
            isInteractive ? 'overflow-visible' : 'overflow-hidden',
            config.showBorder ? 'border-solid border-black' : 'border border-slate-300'
          )}
          style={{
            width: `${widthMm || 58}mm`,
            height: `${heightMm || 40}mm`,
            minWidth: `${widthMm || 58}mm`,
            minHeight: `${heightMm || 40}mm`,
            padding: `${config.paddingY ?? 2}mm ${config.paddingX ?? 2.5}mm`,
            borderWidth: config.showBorder ? `${config.borderWidth || 1}px` : '1px',
            transform: isRotated ? 'rotate(180deg)' : undefined,
          }}
        >
          {/* Alignment Grid Overlay */}
          {showGrid && (
            <div
              className="absolute inset-0 pointer-events-none opacity-25 z-5"
              style={{
                backgroundImage: 'radial-gradient(circle, #2563eb 1px, transparent 1px)',
                backgroundSize: '12px 12px',
              }}
            />
          )}

          {/* Smart Guides (Photoshop / Illustrator Style) */}
          {smartGuides && (
            <>
              {/* Vertical Center Guide Line (Magenta) */}
              {activeGuides.some((g) => g.type === 'vertical-center') && (
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0 z-30 pointer-events-none flex flex-col items-center">
                  <div className="w-[1.5px] h-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)]" />
                  <div className="absolute top-1 bg-rose-600 text-white font-mono text-[8px] font-bold px-1.5 py-0.5 rounded shadow-lg tracking-wider uppercase whitespace-nowrap animate-in fade-in zoom-in-95 duration-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Центр X (0)
                  </div>
                </div>
              )}

              {/* Horizontal Center Guide Line (Magenta) */}
              {activeGuides.some((g) => g.type === 'horizontal-center') && (
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0 z-30 pointer-events-none flex items-center justify-center">
                  <div className="h-[1.5px] w-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)]" />
                  <div className="absolute right-1 bg-rose-600 text-white font-mono text-[8px] font-bold px-1.5 py-0.5 rounded shadow-lg tracking-wider uppercase whitespace-nowrap animate-in fade-in zoom-in-95 duration-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Базовая ось Y (0)
                  </div>
                </div>
              )}

              {/* Element-to-Element Alignment Guides (Cyan) */}
              {activeGuides
                .filter((g) => g.type === 'element-x')
                .map((g) => (
                  <div
                    key={g.id}
                    className="absolute inset-y-0 z-30 pointer-events-none flex flex-col items-center"
                    style={{ left: `calc(50% + ${g.pixelPos || 0}px)` }}
                  >
                    <div className="w-[1.5px] h-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.9)]" />
                    <div className="absolute bottom-1 bg-cyan-600 text-white font-mono text-[8px] font-bold px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap animate-in fade-in zoom-in-95 duration-100">
                      {g.label}
                    </div>
                  </div>
                ))}
            </>
          )}

          {/* Elements Stack */}
          <div className="flex-1 flex flex-col justify-between h-full w-full relative z-10">
            {sortedElements.map((el, elIndex) => {
              if (!el.visible) return null;
              const isSelected = selectedElementId === el.id;
              const isTopElement = elIndex === 0;

              return (
                <div
                  key={el.id}
                  onClick={(e) => {
                    if (isInteractive) {
                      e.stopPropagation();
                      onSelectElement?.(el.id);
                    }
                  }}
                  onMouseDown={(e) => handleMouseDown(e, el.id)}
                  style={{
                    transform: `translate(${el.offsetX || 0}px, ${el.offsetY || 0}px)`,
                  }}
                  className={cn(
                    'relative group/el cursor-pointer transition-shadow rounded-xs',
                    isInteractive && 'hover:ring-1 hover:ring-blue-400 hover:bg-blue-50/20',
                    isSelected && 'ring-2 ring-blue-600 bg-blue-50/30 z-20'
                  )}
                >
                  {/* Floating Action Badge when selected */}
                  {isSelected && isInteractive && (
                    <div
                      className={cn(
                        'absolute left-0 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-lg flex items-center gap-1 z-40 pointer-events-auto whitespace-nowrap ring-1 ring-blue-700/50',
                        isTopElement && (el.offsetY || 0) <= 6 ? 'top-full mt-1.5' : '-top-7 -mt-0.5'
                      )}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Move className="w-2.5 h-2.5 cursor-grab active:cursor-grabbing text-blue-200" />
                      <span className="truncate max-w-[70px]">{el.label}</span>

                      {/* Quick Alignment helper buttons */}
                      {onAlignElement && (
                        <div className="flex items-center border-l border-blue-400/60 pl-1 ml-0.5 gap-0.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onAlignElement(el.id, 'left')}
                            title="Прижать влево (-15px)"
                            className="h-5 w-5 p-0 hover:bg-blue-700 text-blue-100 hover:text-white rounded"
                          >
                            <AlignLeft className="w-2.5 h-2.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onAlignElement(el.id, 'center')}
                            title="Выровнять по центру (X: 0)"
                            className="h-5 w-5 p-0 hover:bg-blue-700 text-blue-100 hover:text-white rounded"
                          >
                            <AlignCenter className="w-2.5 h-2.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onAlignElement(el.id, 'right')}
                            title="Прижать вправо (+15px)"
                            className="h-5 w-5 p-0 hover:bg-blue-700 text-blue-100 hover:text-white rounded"
                          >
                            <AlignRight className="w-2.5 h-2.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onAlignElement(el.id, 'reset')}
                            title="Сбросить смещение (X:0, Y:0)"
                            className="h-5 w-5 p-0 hover:bg-blue-700 text-blue-100 hover:text-white rounded"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                          </Button>
                        </div>
                      )}

                      {/* Order and Visibility Controls */}
                      <div className="flex items-center border-l border-blue-400/60 pl-1 ml-0.5 gap-0.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => onReorderElement?.(el.id, 'up')}
                          title="Поднять выше"
                          className="h-5 w-5 p-0 hover:bg-blue-700 text-white rounded"
                        >
                          <ArrowUp className="w-2.5 h-2.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => onReorderElement?.(el.id, 'down')}
                          title="Опустить ниже"
                          className="h-5 w-5 p-0 hover:bg-blue-700 text-white rounded"
                        >
                          <ArrowDown className="w-2.5 h-2.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => onToggleElementVisibility?.(el.id)}
                          title="Скрыть элемент"
                          className="h-5 w-5 p-0 hover:bg-blue-700 text-white rounded"
                        >
                          <Eye className="w-2.5 h-2.5" />
                        </Button>
                        {onDeleteElement && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeleteElement(el.id)}
                            title="Удалить элемент"
                            className="h-5 w-5 p-0 hover:bg-red-700 text-red-200 rounded"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  <LabelLiveElement
                    element={el}
                    config={config}
                    activeProduct={activeProduct}
                    currentDate={currentDate}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Info Badge */}
      <div className="mt-3 flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 bg-white/90 dark:bg-slate-800/90 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-2xs">
        <span>Размер: {widthMm} × {heightMm} мм</span>
        <span>•</span>
        <span>Элементов: {sortedElements.filter((e) => e.visible).length} активных</span>
        {isRotated && (
          <>
            <span>•</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">Поворот 180°</span>
          </>
        )}
      </div>
    </div>
  );
}

