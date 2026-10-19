'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { PrintTemplateConfig, LabelElement } from '../types';
import { getTemplateElements } from '../lib/label-elements';
import { Eye, ArrowUp, ArrowDown, Trash2, Move } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';
import { SAMPLE_PRODUCTS, type SampleProduct } from '../constants/sample-products';
import { LabelLiveElement, LabelPreviewToolbar } from './preview';

interface LabelLivePreviewProps {
  widthMm: number;
  heightMm: number;
  config: PrintTemplateConfig;
  elements?: LabelElement[];
  selectedElementId?: string | null;
  onSelectElement?: (id: string | null) => void;
  onMoveElement?: (id: string, deltaX: number, deltaY: number) => void;
  onReorderElement?: (id: string, direction: 'up' | 'down') => void;
  onToggleElementVisibility?: (id: string) => void;
  onDeleteElement?: (id: string) => void;
  product?: SampleProduct;
  showControls?: boolean;
  isInteractive?: boolean;
}

export function LabelLivePreview({
  widthMm,
  heightMm,
  config,
  elements: propsElements,
  selectedElementId = null,
  onSelectElement,
  onMoveElement,
  onReorderElement,
  onToggleElementVisibility,
  onDeleteElement,
  product,
  showControls = true,
  isInteractive = true,
}: LabelLivePreviewProps) {
  const [zoom, setZoom] = useState(1);
  const [sampleIndex, setSampleIndex] = useState(0);

  // Dragging state on canvas
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; elId: string } | null>(null);

  const activeProduct = product || SAMPLE_PRODUCTS[sampleIndex];

  // Active elements list
  const activeElements = propsElements || getTemplateElements(config);
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
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY, elId };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragStartRef.current) return;
      const dx = Math.round((e.clientX - dragStartRef.current.x) / zoom);
      const dy = Math.round((e.clientY - dragStartRef.current.y) / zoom);

      if (Math.abs(dx) >= 2 || Math.abs(dy) >= 2) {
        onMoveElement?.(dragStartRef.current.elId, dx, dy);
        dragStartRef.current.x = e.clientX;
        dragStartRef.current.y = e.clientY;
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        dragStartRef.current = null;
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
  }, [isDragging, zoom, onMoveElement]);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Interactive Controls Bar: Sample Switcher & Zoom */}
      {showControls && (
        <LabelPreviewToolbar
          sampleIndex={sampleIndex}
          onSampleChange={setSampleIndex}
          zoom={zoom}
          onZoomIn={() => setZoom((z) => Math.min(2.0, +(z + 0.25).toFixed(2)))}
          onZoomOut={() => setZoom((z) => Math.max(0.75, +(z - 0.25).toFixed(2)))}
          onZoomReset={() => setZoom(1)}
        />
      )}

      {/* Label Canvas Container */}
      <div
        className="transition-transform duration-150 origin-top select-none"
        style={{
          transform: `scale(${zoom})`,
          marginBottom: zoom > 1 ? `${(zoom - 1) * 80}px` : undefined,
        }}
        onClick={() => isInteractive && onSelectElement?.(null)}
      >
        <div
          className={cn(
            'relative bg-white text-black rounded-xs shadow-md overflow-hidden flex flex-col justify-between p-2 select-none box-border transition-all',
            config.showBorder ? 'border-solid border-black' : 'border border-slate-300'
          )}
          style={{
            width: `${widthMm || 58}mm`,
            height: `${heightMm || 40}mm`,
            minWidth: `${widthMm || 58}mm`,
            minHeight: `${heightMm || 40}mm`,
            borderWidth: config.showBorder ? `${config.borderWidth || 1}px` : '1px',
            transform: isRotated ? 'rotate(180deg)' : undefined,
          }}
        >
          {/* Elements Stack */}
          <div className="flex-1 flex flex-col justify-between h-full w-full">
            {sortedElements.map((el) => {
              if (!el.visible) return null;
              const isSelected = selectedElementId === el.id;

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
                      className="absolute -top-6 left-0 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-md flex items-center gap-1 z-30 pointer-events-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Move className="w-2.5 h-2.5 cursor-grab active:cursor-grabbing" />
                      <span className="truncate max-w-[80px]">{el.label}</span>
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
