'use client';

import React from 'react';
import JsBarcode from 'jsbarcode';
import type { ElementRenderProps } from '../../../model/element-registry-types';
import { cn } from '@/shared/lib/utils';
import { QrCodeSvg } from '../QrCodeSvg';

import { isWeightProduct } from '../../../lib/template-resolver';

export function StoreNamePreview({ element: el, config }: ElementRenderProps) {
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
}

export function ProductNamePreview({ element: el, config, activeProduct }: ElementRenderProps) {
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
}

export function PricePreview({ element: el, config, activeProduct }: ElementRenderProps) {
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
}

export function OldPricePreview({ element: el, activeProduct }: ElementRenderProps) {
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
}

export function DiscountBadgePreview({ element: el }: ElementRenderProps) {
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
}

export function BarcodePreview({ element: el, activeProduct }: ElementRenderProps) {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const barcode = String(activeProduct.barcode || '4780111550194').trim();
  const rawH = Math.min(60, Math.max(16, (el.barcodeHeight || 45) / 2.2));

  const isWeight = activeProduct.isWeight || activeProduct.measureName?.toLowerCase().includes('кг');
  const hideOnWeight = el.barcodeHideOnWeight;

  React.useEffect(() => {
    if (!svgRef.current) return;
    if (hideOnWeight && isWeight) return;

    try {
      const preferredFormat = el.barcodeType === 'EAN13' || /^\d{13}$/.test(barcode) ? 'EAN13' : 'CODE128';
      const barW = el.barcodeWidth === 1 ? 1.2 : el.barcodeWidth === 3 ? 2.2 : 1.6;

      try {
        JsBarcode(svgRef.current, barcode, {
          format: preferredFormat,
          width: barW,
          height: rawH,
          displayValue: el.showBarcodeDigits !== false,
          fontSize: 10,
          font: 'monospace',
          margin: 0,
          background: 'transparent',
          lineColor: '#000000',
        });
      } catch {
        JsBarcode(svgRef.current, barcode, {
          format: 'CODE128',
          width: barW,
          height: rawH,
          displayValue: el.showBarcodeDigits !== false,
          fontSize: 10,
          font: 'monospace',
          margin: 0,
          background: 'transparent',
          lineColor: '#000000',
        });
      }
    } catch (err) {
      console.warn('Barcode preview error:', err);
    }
  }, [barcode, rawH, el.showBarcodeDigits, el.barcodeType, el.barcodeWidth, hideOnWeight, isWeight]);

  if (hideOnWeight && isWeight) {
    return (
      <div className="w-full flex items-center justify-center my-0.5 py-1 px-2 border border-dashed border-slate-300 rounded text-[9px] text-slate-400 font-mono">
        Штрихкод скрыт для весового товара
      </div>
    );
  }

  const justifyClass =
    el.textAlign === 'left' ? 'items-start' : el.textAlign === 'right' ? 'items-end' : 'items-center';

  return (
    <div className={cn('w-full flex flex-col my-0.5 overflow-hidden', justifyClass)}>
      <svg ref={svgRef} className="max-w-full" />
    </div>
  );
}

export function PluCodePreview({ element: el, activeProduct }: ElementRenderProps) {
  const isWeight = isWeightProduct(activeProduct);
  const rawPlu = activeProduct.plu || (activeProduct as any).aliasList?.[0] || (isWeight ? activeProduct.barcode || '452' : '452');
  const plu = String(rawPlu);
  const showOnlyForWeight = el.showOnlyForWeight !== false;

  if (showOnlyForWeight && !isWeight && !activeProduct.plu) {
    return (
      <div className="w-full flex items-center justify-center my-0.5 py-1 px-2 border border-dashed border-amber-300 bg-amber-50/50 rounded text-[9px] text-amber-600 font-mono">
        PLU: скрыт (товар штучный, отображается для весовых)
      </div>
    );
  }

  const pluStyle = el.pluStyle || 'box';
  const labelText = el.pluLabel ?? 'PLU КОД';
  const labelPosition = el.pluLabelPosition || 'top';
  const fontSizePt = el.fontSize || 14;

  const trackingClass =
    el.letterSpacing === 'normal'
      ? 'tracking-normal'
      : el.letterSpacing === 'widest'
      ? 'tracking-[0.25em]'
      : 'tracking-[0.15em]';

  const justifyClass =
    el.textAlign === 'left' ? 'justify-start' : el.textAlign === 'right' ? 'justify-end' : 'justify-center';

  const alignItemClass =
    el.textAlign === 'left' ? 'items-start' : el.textAlign === 'right' ? 'items-end' : 'items-center';

  // Содержимое самого номера PLU в зависимости от стиля
  const renderPluNumber = () => {
    switch (pluStyle) {
      case 'badge':
        return (
          <div className="bg-black text-white rounded px-2.5 py-0.5 inline-flex items-center justify-center shadow-xs">
            <span
              className={cn('font-black font-mono leading-none', trackingClass)}
              style={{ fontSize: `${fontSizePt}pt` }}
            >
              {plu}
            </span>
          </div>
        );
      case 'underline':
        return (
          <div className="border-b-2 border-black px-1.5 pb-0.5 inline-flex items-center justify-center">
            <span
              className={cn('font-black font-mono text-black leading-none', trackingClass)}
              style={{ fontSize: `${fontSizePt}pt` }}
            >
              {plu}
            </span>
          </div>
        );
      case 'plain':
        return (
          <span
            className={cn('font-black font-mono text-black leading-none', trackingClass)}
            style={{ fontSize: `${fontSizePt}pt` }}
          >
            {plu}
          </span>
        );
      case 'box':
      default:
        return (
          <div className="border-2 border-black rounded px-2.5 py-0.5 inline-flex items-center justify-center">
            <span
              className={cn('font-black font-mono text-black leading-none', trackingClass)}
              style={{ fontSize: `${fontSizePt}pt` }}
            >
              {plu}
            </span>
          </div>
        );
    }
  };

  return (
    <div className={cn('w-full flex flex-col my-0.5 py-0.5', alignItemClass)}>
      {labelPosition === 'top' && labelText && (
        <span className="text-[7.5px] font-mono text-slate-500 uppercase tracking-widest leading-none mb-0.5">
          {labelText}
        </span>
      )}

      {labelPosition === 'inline' ? (
        <div className={cn('flex items-center gap-1.5', justifyClass)}>
          {labelText && (
            <span className="text-[9px] font-mono font-bold text-slate-600 uppercase tracking-wider">
              {labelText}
            </span>
          )}
          {renderPluNumber()}
        </div>
      ) : (
        renderPluNumber()
      )}
    </div>
  );
}

export function QrCodePreview({ element: el }: ElementRenderProps) {
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
}

export function ProductCodePreview({ element: el, activeProduct }: ElementRenderProps) {
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
}

export function CountryPreview({ element: el, activeProduct }: ElementRenderProps) {
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
}

export function DatePreview({ element: el, currentDate }: ElementRenderProps) {
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
}

export function DividerPreview({ element: el }: ElementRenderProps) {
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
}

export function CustomTextPreview({ element: el }: ElementRenderProps) {
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
