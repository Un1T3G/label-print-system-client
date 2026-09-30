'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PrintTemplateConfig, LabelElement } from '@/lib/types';
import { getTemplateElements } from '@/lib/label-elements';
import { ZoomIn, ZoomOut, RotateCcw, Eye, ArrowUp, ArrowDown, Trash2, Move } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  product?: {
    name: string;
    price: number;
    barcode: string;
    measureName: string;
    code?: string;
    country?: string;
  };
  showControls?: boolean;
  isInteractive?: boolean;
}

const SAMPLE_PRODUCTS = [
  {
    name: 'Черноголовка Тархун 1.5л (T)',
    price: 12000,
    barcode: '4780111550194',
    measureName: 'шт.',
    code: '10452',
    country: 'Россия',
  },
  {
    name: 'Шоколад «Казахстан» темный классический 100г Рахат',
    price: 15500,
    barcode: '4870002010123',
    measureName: 'шт.',
    code: '20891',
    country: 'Казахстан',
  },
  {
    name: 'Яблоки «Апорт» свежие отборные премиум',
    price: 8500,
    barcode: '2000000100452',
    measureName: 'кг.',
    code: '33104',
    country: 'Узбекистан',
  },
];

// Clean vector SVG QR code representation
function QrCodeSvg({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 29 29"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 select-none"
    >
      <rect width="29" height="29" fill="white" />
      {/* Top-Left Finder */}
      <rect x="2" y="2" width="7" height="7" fill="black" />
      <rect x="3" y="3" width="5" height="5" fill="white" />
      <rect x="4" y="4" width="3" height="3" fill="black" />

      {/* Top-Right Finder */}
      <rect x="20" y="2" width="7" height="7" fill="black" />
      <rect x="21" y="3" width="5" height="5" fill="white" />
      <rect x="22" y="4" width="3" height="3" fill="black" />

      {/* Bottom-Left Finder */}
      <rect x="2" y="20" width="7" height="7" fill="black" />
      <rect x="3" y="21" width="5" height="5" fill="white" />
      <rect x="4" y="22" width="3" height="3" fill="black" />

      {/* Timing and alignment bars */}
      <line x1="5" y1="10" x2="5" y2="19" stroke="black" strokeWidth="1" strokeDasharray="1 1" />
      <line x1="10" y1="5" x2="19" y2="5" stroke="black" strokeWidth="1" strokeDasharray="1 1" />

      {/* Internal QR Data Cells */}
      <rect x="11" y="11" width="3" height="3" fill="black" />
      <rect x="15" y="11" width="2" height="2" fill="black" />
      <rect x="11" y="15" width="2" height="2" fill="black" />
      <rect x="14" y="14" width="3" height="3" fill="black" />
      <rect x="18" y="12" width="2" height="2" fill="black" />
      <rect x="11" y="19" width="3" height="2" fill="black" />
      <rect x="15" y="18" width="2" height="3" fill="black" />
      <rect x="20" y="11" width="2" height="2" fill="black" />
      <rect x="23" y="12" width="3" height="2" fill="black" />
      <rect x="20" y="15" width="4" height="2" fill="black" />
      <rect x="22" y="19" width="2" height="4" fill="black" />
      <rect x="18" y="22" width="3" height="2" fill="black" />
      <rect x="12" y="23" width="2" height="3" fill="black" />
      <rect x="15" y="23" width="2" height="2" fill="black" />
      <rect x="25" y="23" width="2" height="3" fill="black" />
    </svg>
  );
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

  // Render individual element content
  const renderElementContent = (el: LabelElement) => {
    switch (el.type) {
      case 'storeName':
        return (
          <div
            className={cn(
              'w-full uppercase tracking-wider font-extrabold pb-0.5',
              el.borderBottom && 'border-b border-black/25',
              el.textAlign === 'center' ? 'text-center' : el.textAlign === 'right' ? 'text-right' : 'text-left'
            )}
            style={{
              fontSize: `${el.fontSize || 9}pt`,
              fontWeight: el.fontWeight === 'bold' ? 700 : el.fontWeight === 'black' ? 900 : 600,
            }}
          >
            {el.content || config.storeNameText || 'ALPAMIS'}
          </div>
        );

      case 'productName':
        return (
          <div
            className={cn(
              'w-full leading-tight font-bold break-words',
              el.lineClamp === 1 && 'truncate',
              el.lineClamp === 2 && 'line-clamp-2',
              el.lineClamp === 3 && 'line-clamp-3',
              el.textAlign === 'center' ? 'text-center' : el.textAlign === 'right' ? 'text-right' : 'text-left'
            )}
            style={{
              fontSize: `${el.fontSize || config.titleFontSize || 11}pt`,
              fontWeight: el.fontWeight === 'black' ? 900 : el.fontWeight === 'normal' ? 400 : 700,
            }}
          >
            {activeProduct.name}
          </div>
        );

      case 'price':
        return (
          <div
            className={cn(
              'w-full flex items-baseline my-0.5 py-0.5',
              el.borderBottom && 'border-b border-t border-black/25',
              el.textAlign === 'center'
                ? 'justify-center gap-2'
                : el.textAlign === 'right'
                ? 'justify-end gap-2'
                : 'justify-between'
            )}
          >
            <div className="flex items-baseline gap-1">
              <span
                className="font-black tracking-tight text-black leading-none"
                style={{
                  fontSize: `${el.fontSize || config.priceFontSize || 24}pt`,
                }}
              >
                {activeProduct.price.toLocaleString('ru-RU')}
              </span>
              <span className="font-bold text-[11px] uppercase">
                {el.currencySymbol || config.currencySymbol || 'сум'}
              </span>
            </div>

            {el.showMeasure !== false && (
              <span className="text-[9px] font-semibold text-slate-700 bg-slate-100 px-1 py-0.5 rounded shrink-0">
                за {activeProduct.measureName}
              </span>
            )}
          </div>
        );

      case 'oldPrice':
        return (
          <div
            className={cn(
              'w-full text-slate-500 font-medium text-[10px] flex items-center gap-1',
              el.textAlign === 'center' ? 'justify-center' : el.textAlign === 'right' ? 'justify-end' : 'justify-start'
            )}
            style={{
              fontSize: `${el.fontSize || 10}pt`,
            }}
          >
            {el.prefix && <span>{el.prefix}</span>}
            <span className="line-through decoration-black/60 decoration-[1.5px] font-bold text-slate-800">
              {(el.oldPriceValue || Math.round(activeProduct.price * 1.25)).toLocaleString('ru-RU')}
            </span>
            {el.suffix && <span>{el.suffix}</span>}
          </div>
        );

      case 'discountBadge':
        return (
          <div
            className={cn(
              'w-full flex my-0.5',
              el.textAlign === 'center' ? 'justify-center' : el.textAlign === 'right' ? 'justify-end' : 'justify-start'
            )}
          >
            <span
              className={cn(
                'px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase inline-block',
                el.inverted ? 'bg-black text-white' : 'border border-black text-black'
              )}
              style={{
                fontSize: `${el.fontSize || 9}pt`,
              }}
            >
              {el.content || '★ АКЦИЯ -20% ★'}
            </span>
          </div>
        );

      case 'barcode':
        return (
          <div className="w-full flex flex-col items-center mt-0.5">
            {/* Realistic Barcode Stripes */}
            <div
              className="w-full flex items-center justify-center gap-[1.5px] overflow-hidden px-1"
              style={{
                height: `${Math.min(36, Math.max(14, (el.barcodeHeight || 45) / 2.4))}px`,
              }}
            >
              {[...Array(34)].map((_, i) => (
                <div
                  key={i}
                  className="bg-black h-full"
                  style={{
                    width: i % 5 === 0 ? '2.5px' : i % 2 === 0 ? '1.5px' : '1px',
                  }}
                />
              ))}
            </div>

            {el.showBarcodeDigits !== false && (
              <span className="font-mono text-[8.5px] font-bold tracking-widest text-slate-900 leading-none mt-0.5">
                {activeProduct.barcode}
              </span>
            )}
          </div>
        );

      case 'qrcode':
        return (
          <div
            className={cn(
              'w-full flex my-0.5',
              el.textAlign === 'left' ? 'justify-start' : el.textAlign === 'right' ? 'justify-end' : 'justify-center'
            )}
          >
            <div className="p-0.5 border border-slate-300 rounded bg-white inline-block">
              <QrCodeSvg size={el.qrSize || 36} />
            </div>
          </div>
        );

      case 'productCode':
        return (
          <div
            className={cn(
              'w-full text-[8.5px] font-mono text-slate-700',
              el.textAlign === 'center' ? 'text-center' : el.textAlign === 'right' ? 'text-right' : 'text-left'
            )}
            style={{
              fontSize: `${el.fontSize || 8.5}pt`,
              fontWeight: el.fontWeight === 'bold' ? 700 : 500,
            }}
          >
            {el.prefix || 'Арт: '}
            <strong className="text-black">{activeProduct.code || el.content || '10452'}</strong>
            {el.suffix || ''}
          </div>
        );

      case 'country':
        return (
          <div
            className={cn(
              'w-full text-[8px] text-slate-600',
              el.textAlign === 'center' ? 'text-center' : el.textAlign === 'right' ? 'text-right' : 'text-left'
            )}
            style={{
              fontSize: `${el.fontSize || 8}pt`,
            }}
          >
            {el.prefix || 'Страна: '}
            <span className="font-semibold text-slate-900">
              {activeProduct.country || el.content || 'Узбекистан'}
            </span>
          </div>
        );

      case 'date':
        return (
          <div
            className={cn(
              'w-full text-[8px] font-mono text-slate-600',
              el.textAlign === 'center' ? 'text-center' : el.textAlign === 'left' ? 'text-left' : 'text-right'
            )}
            style={{
              fontSize: `${el.fontSize || 8}pt`,
            }}
          >
            {el.prefix || ''}{currentDate}{el.suffix || ''}
          </div>
        );

      case 'divider':
        return (
          <div
            className="w-full my-0.5"
            style={{
              borderBottom: `${el.borderWidth || 1}px solid black`,
              paddingTop: `${el.paddingY || 1}px`,
              paddingBottom: `${el.paddingY || 1}px`,
            }}
          />
        );

      case 'customText':
      default:
        return (
          <div
            className={cn(
              'w-full text-[8.5px] font-medium text-slate-800 break-words',
              el.textTransform === 'uppercase' && 'uppercase tracking-wider',
              el.fontStyle === 'italic' && 'italic',
              el.textAlign === 'center' ? 'text-center' : el.textAlign === 'right' ? 'text-right' : 'text-left',
              el.inverted && 'bg-black text-white px-1.5 py-0.5 rounded'
            )}
            style={{
              fontSize: `${el.fontSize || 8.5}pt`,
              fontWeight: el.fontWeight === 'black' ? 900 : el.fontWeight === 'bold' ? 700 : 500,
            }}
          >
            {el.prefix || ''}{el.content || 'Произвольный текст'}{el.suffix || ''}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Interactive Controls Bar: Sample Switcher & Zoom */}
      {showControls && (
        <div className="flex items-center justify-between w-full max-w-sm mb-3 px-2.5 py-1.5 bg-slate-100/90 rounded-xl text-xs text-slate-600 border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-500">Товар:</span>
            <select
              value={sampleIndex}
              onChange={(e) => setSampleIndex(Number(e.target.value))}
              className="text-[11px] bg-white border border-slate-200 rounded-lg px-2 py-0.5 focus:outline-none max-w-[130px] font-medium"
            >
              <option value={0}>Черноголовка 1.5л</option>
              <option value={1}>Шоколад Рахат</option>
              <option value={2}>Яблоки (весовой кг)</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.75, +(z - 0.25).toFixed(2)))}
              className="p-1 hover:bg-white rounded-md transition text-slate-600"
              title="Уменьшить масштаб"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[10px] w-9 text-center font-bold">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(2.0, +(z + 0.25).toFixed(2)))}
              className="p-1 hover:bg-white rounded-md transition text-slate-600"
              title="Увеличить масштаб"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            {zoom !== 1 && (
              <button
                type="button"
                onClick={() => setZoom(1)}
                className="p-1 hover:bg-white rounded-md transition text-slate-400 hover:text-slate-700"
                title="Сбросить масштаб"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
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
                      <button
                        type="button"
                        onClick={() => onReorderElement?.(el.id, 'up')}
                        title="Поднять выше"
                        className="hover:bg-blue-700 p-0.5 rounded"
                      >
                        <ArrowUp className="w-2.5 h-2.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onReorderElement?.(el.id, 'down')}
                        title="Опустить ниже"
                        className="hover:bg-blue-700 p-0.5 rounded"
                      >
                        <ArrowDown className="w-2.5 h-2.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleElementVisibility?.(el.id)}
                        title="Скрыть элемент"
                        className="hover:bg-blue-700 p-0.5 rounded"
                      >
                        <Eye className="w-2.5 h-2.5" />
                      </button>
                      {onDeleteElement && (
                        <button
                          type="button"
                          onClick={() => onDeleteElement(el.id)}
                          title="Удалить элемент"
                          className="hover:bg-red-700 p-0.5 rounded text-red-200"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  )}

                  {renderElementContent(el)}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Info Badge */}
      <div className="mt-3 flex items-center gap-2 text-xs font-mono text-slate-500 bg-white/90 px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
        <span>Размер: {widthMm} × {heightMm} мм</span>
        <span>•</span>
        <span>Элементов: {sortedElements.filter((e) => e.visible).length} активных</span>
        {isRotated && (
          <>
            <span>•</span>
            <span className="text-amber-600 font-semibold">Поворот 180°</span>
          </>
        )}
      </div>
    </div>
  );
}
