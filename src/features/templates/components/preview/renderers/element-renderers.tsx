'use client';

import React from 'react';
import type { ElementRenderProps } from '../../../model/element-registry-types';
import { cn } from '@/shared/lib/utils';
import { QrCodeSvg } from '../QrCodeSvg';

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
  return (
    <div className="w-full flex flex-col items-center mt-0.5">
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
