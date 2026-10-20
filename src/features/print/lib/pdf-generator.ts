import { jsPDF } from 'jspdf';
import type { PrintTemplate } from '@/features/templates';
import { getTemplateElements } from '@/features/templates';
import type { PrintJobItem } from '../types';

export interface GeneratePdfOptions {
  template: PrintTemplate;
  items: PrintJobItem[];
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Генерирует HTML разметку ценника в 100% точном соответствии с LabelLivePreview.
 * Использует нативный CSS Flexbox justify-between и pt-размеры шрифтов.
 */
export function renderLabelHtml(template: PrintTemplate, item: PrintJobItem): string {
  const elements = getTemplateElements(template.config);
  const sorted = [...elements].filter((el) => el.visible).sort((a, b) => a.order - b.order);

  const currentDate = new Date().toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });

  const elementsHtml = sorted
    .map((el) => {
      const offX = el.offsetX || 0;
      const offY = el.offsetY || 0;
      const transformStyle = offX !== 0 || offY !== 0 ? `transform: translate(${offX}px, ${offY}px);` : '';

      switch (el.type) {
        case 'storeName': {
          const fontSize = el.fontSize || 9;
          const fontWeight = el.fontWeight === 'bold' ? 700 : el.fontWeight === 'black' ? 900 : 600;
          const align = el.textAlign || 'left';
          const text = (el.content || template.config.storeNameText || 'ALPAMIS').toUpperCase();
          const borderStyle = el.borderBottom ? 'border-bottom: 1px solid rgba(0,0,0,0.25); padding-bottom: 2px;' : '';
          return `
            <div style="width: 100%; text-transform: uppercase; letter-spacing: 0.05em; font-weight: ${fontWeight}; font-size: ${fontSize}pt; text-align: ${align}; ${borderStyle} ${transformStyle}">
              ${escapeHtml(text)}
            </div>
          `;
        }

        case 'productName': {
          const fontSize = el.fontSize || template.config.titleFontSize || 11;
          const fontWeight = el.fontWeight === 'black' ? 900 : el.fontWeight === 'normal' ? 400 : 700;
          const align = el.textAlign || 'left';
          const lineClamp = el.lineClamp || 2;
          return `
            <div style="width: 100%; font-size: ${fontSize}pt; font-weight: ${fontWeight}; line-height: 1.15; word-break: break-word; text-align: ${align}; overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: ${lineClamp}; ${transformStyle}">
              ${escapeHtml(item.name)}
            </div>
          `;
        }

        case 'price': {
          const fontSize = el.fontSize || template.config.priceFontSize || 24;
          const align = el.textAlign || 'left';
          const justify = align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'space-between';
          const priceFormatted = item.price.toLocaleString('ru-RU');
          const currency = (el.currencySymbol || template.config.currencySymbol || 'сум').toUpperCase();
          const borderStyle = el.borderBottom ? 'border-top: 1px solid rgba(0,0,0,0.25); border-bottom: 1px solid rgba(0,0,0,0.25); padding: 2px 0;' : '';

          const measureBadge =
            el.showMeasure !== false
              ? `<span style="font-size: 9px; font-weight: 600; color: #334155; background: #f1f5f9; padding: 2px 4px; border-radius: 3px; flex-shrink: 0;">за ${escapeHtml(item.measureName || 'шт.')}</span>`
              : '';

          return `
            <div style="width: 100%; display: flex; align-items: baseline; margin: 2px 0; justify-content: ${justify}; ${borderStyle} ${transformStyle}">
              <div style="display: flex; align-items: baseline; gap: 4px;">
                <span style="font-size: ${fontSize}pt; font-weight: 900; letter-spacing: -0.03em; line-height: 1; color: #000;">${priceFormatted}</span>
                <span style="font-size: 11px; font-weight: 700; text-transform: uppercase;">${escapeHtml(currency)}</span>
              </div>
              ${measureBadge}
            </div>
          `;
        }

        case 'oldPrice': {
          const fontSize = el.fontSize || 10;
          const align = el.textAlign || 'left';
          const justify = align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start';
          const oldVal = el.oldPriceValue || Math.round(item.price * 1.25);
          return `
            <div style="width: 100%; display: flex; align-items: center; gap: 4px; font-size: ${fontSize}pt; color: #64748b; font-weight: 500; justify-content: ${justify}; ${transformStyle}">
              ${el.prefix ? `<span>${escapeHtml(el.prefix)}</span>` : ''}
              <span style="text-decoration: line-through; text-decoration-color: rgba(0,0,0,0.6); text-decoration-thickness: 1.5px; font-weight: 700; color: #1e293b;">
                ${oldVal.toLocaleString('ru-RU')}
              </span>
              ${el.suffix ? `<span>${escapeHtml(el.suffix)}</span>` : ''}
            </div>
          `;
        }

        case 'discountBadge': {
          const fontSize = el.fontSize || 9;
          const align = el.textAlign || 'center';
          const justify = align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start';
          const text = (el.content || '★ АКЦИЯ -20% ★').toUpperCase();
          const badgeStyle = el.inverted
            ? 'background: #000000; color: #ffffff;'
            : 'border: 1px solid #000000; color: #000000;';
          return `
            <div style="width: 100%; display: flex; justify-content: ${justify}; margin: 2px 0; ${transformStyle}">
              <span style="font-size: ${fontSize}pt; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; padding: 2px 6px; border-radius: 3px; display: inline-block; ${badgeStyle}">
                ${escapeHtml(text)}
              </span>
            </div>
          `;
        }

        case 'barcode': {
          const rawH = Math.min(36, Math.max(14, (el.barcodeHeight || 45) / 2.4));
          const barsHtml = [...Array(34)]
            .map((_, i) => {
              const width = i % 5 === 0 ? '2.5px' : i % 2 === 0 ? '1.5px' : '1px';
              return `<div style="background: #000000; height: 100%; width: ${width}; flex-shrink: 0;"></div>`;
            })
            .join('');

          const digitsHtml =
            el.showBarcodeDigits !== false
              ? `<span style="font-family: monospace; font-size: 8.5px; font-weight: 700; letter-spacing: 0.15em; color: #0f172a; line-height: 1; margin-top: 2px;">${escapeHtml(item.barcode)}</span>`
              : '';

          return `
            <div style="width: 100%; display: flex; flex-direction: column; align-items: center; margin-top: 2px; ${transformStyle}">
              <div style="display: flex; align-items: center; justify-content: center; gap: 1.5px; height: ${rawH}px; width: 100%; overflow: hidden; padding: 0 4px;">
                ${barsHtml}
              </div>
              ${digitsHtml}
            </div>
          `;
        }

        case 'divider': {
          return `<div style="width: 100%; height: 1px; background: #000000; opacity: 0.25; margin: 2px 0; ${transformStyle}"></div>`;
        }

        case 'date': {
          const fontSize = el.fontSize || 8.5;
          const align = el.textAlign || 'left';
          return `
            <div style="width: 100%; font-size: ${fontSize}pt; text-align: ${align}; color: #64748b; font-weight: 500; ${transformStyle}">
              ${escapeHtml(el.prefix || '')}${currentDate}${escapeHtml(el.suffix || '')}
            </div>
          `;
        }

        case 'productCode': {
          const fontSize = el.fontSize || 8.5;
          const align = el.textAlign || 'left';
          const code = el.content || item.barcode.slice(-5);
          return `
            <div style="width: 100%; font-size: ${fontSize}pt; font-weight: 700; text-align: ${align}; color: #000000; ${transformStyle}">
              ${escapeHtml(el.prefix || 'Арт: ')}${escapeHtml(code)}${escapeHtml(el.suffix || '')}
            </div>
          `;
        }

        case 'country': {
          const fontSize = el.fontSize || 8.5;
          const align = el.textAlign || 'left';
          const text = el.content || 'Узбекистан';
          return `
            <div style="width: 100%; font-size: ${fontSize}pt; text-align: ${align}; color: #475569; ${transformStyle}">
              ${escapeHtml(el.prefix || 'Страна: ')}${escapeHtml(text)}${escapeHtml(el.suffix || '')}
            </div>
          `;
        }

        case 'customText':
        default: {
          const fontSize = el.fontSize || 8.5;
          const align = el.textAlign || 'center';
          const fontWeight = el.fontWeight === 'bold' ? 700 : el.fontWeight === 'black' ? 900 : 500;
          const textTransform = el.textTransform || 'none';
          return `
            <div style="width: 100%; font-size: ${fontSize}pt; font-weight: ${fontWeight}; text-align: ${align}; text-transform: ${textTransform}; ${transformStyle}">
              ${escapeHtml(el.prefix || '')}${escapeHtml(el.content || '')}${escapeHtml(el.suffix || '')}
            </div>
          `;
        }
      }
    })
    .join('');

  return `
    <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%; width: 100%;">
      ${elementsHtml}
    </div>
  `;
}

/**
 * Отрисовка этикетки на Canvas для экспорта в PDF.
 * Расчет вертикального расположения эмулирует CSS flexbox justify-between,
 * а размеры элементов и штрихкода совпадают с LabelLivePreview.
 */
export function drawLabelOnCanvas(
  template: PrintTemplate,
  item: PrintJobItem,
  scale: number = 8 // 8 пикселей на мм (~203 DPI)
): HTMLCanvasElement {
  const widthMm = template.widthMm || 58;
  const heightMm = template.heightMm || 40;
  const widthPx = Math.round(widthMm * scale);
  const heightPx = Math.round(heightMm * scale);

  const canvas = document.createElement('canvas');
  canvas.width = widthPx;
  canvas.height = heightPx;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D context not available');

  // 1. Белый фон
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, widthPx, heightPx);

  // 2. Рамка при включении
  if (template.config.showBorder) {
    const bw = Math.max(1, Math.round((template.config.borderWidth || 1) * (scale / 4)));
    ctx.lineWidth = bw;
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(bw / 2, bw / 2, widthPx - bw, heightPx - bw);
  }

  const elements = getTemplateElements(template.config);
  const sorted = [...elements].filter((el) => el.visible).sort((a, b) => a.order - b.order);

  const padX = Math.round(2.5 * scale);
  const padTop = Math.round(2.1 * scale);
  const contentWidth = widthPx - padX * 2;
  const contentHeight = heightPx - padTop * 2;

  const currentDate = new Date().toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });

  // Предварительный замер высот элементов для честного justify-between
  interface MeasuredElement {
    el: (typeof sorted)[0];
    height: number;
    lines?: string[];
    fontSizePx: number;
  }

  const measured: MeasuredElement[] = [];

  for (const el of sorted) {
    switch (el.type) {
      case 'storeName': {
        const fontSizePx = Math.round((el.fontSize || 9) * (scale / 2.83));
        const h = fontSizePx + (el.borderBottom ? 6 : 2);
        measured.push({ el, height: h, fontSizePx });
        break;
      }
      case 'productName': {
        const fontSizePx = Math.round((el.fontSize || template.config.titleFontSize || 11) * (scale / 2.83));
        const fontWeight = el.fontWeight === 'black' ? 900 : el.fontWeight === 'normal' ? 400 : 700;
        ctx.font = `${fontWeight} ${fontSizePx}px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`;
        const lines = wrapText(ctx, item.name, contentWidth, el.lineClamp || 2);
        const lineHeight = fontSizePx * 1.15;
        measured.push({ el, height: lines.length * lineHeight, lines, fontSizePx });
        break;
      }
      case 'price': {
        const fontSizePx = Math.round((el.fontSize || template.config.priceFontSize || 24) * (scale / 2.83));
        const h = fontSizePx + (el.borderBottom ? 8 : 4);
        measured.push({ el, height: h, fontSizePx });
        break;
      }
      case 'oldPrice': {
        const fontSizePx = Math.round((el.fontSize || 10) * (scale / 2.83));
        measured.push({ el, height: fontSizePx + 2, fontSizePx });
        break;
      }
      case 'discountBadge': {
        const fontSizePx = Math.round((el.fontSize || 9) * (scale / 2.83));
        measured.push({ el, height: fontSizePx + 8, fontSizePx });
        break;
      }
      case 'barcode': {
        const rawH = Math.min(36, Math.max(14, (el.barcodeHeight || 45) / 2.4));
        const barcodeH = Math.round(rawH * (scale / 3.78));
        const digitsH = el.showBarcodeDigits !== false ? Math.round(8.5 * (scale / 3.2)) + 3 : 0;
        measured.push({ el, height: barcodeH + digitsH, fontSizePx: 0 });
        break;
      }
      case 'divider': {
        measured.push({ el, height: 4, fontSizePx: 0 });
        break;
      }
      default: {
        const fontSizePx = Math.round((el.fontSize || 8.5) * (scale / 2.83));
        measured.push({ el, height: fontSizePx + 2, fontSizePx });
        break;
      }
    }
  }

  // Расчет вертикального отступа между элементами (Flexbox justify-between)
  const totalElementsHeight = measured.reduce((acc, m) => acc + m.height, 0);
  const availableSpace = contentHeight - totalElementsHeight;
  const numGaps = measured.length > 1 ? measured.length - 1 : 1;
  const gapBetween = measured.length > 1 ? Math.max(2, Math.min(24, availableSpace / numGaps)) : 2;

  let currentY = padTop;

  for (const itemM of measured) {
    const { el, fontSizePx } = itemM;
    const offX = Math.round((el.offsetX || 0) * (scale / 3.78));
    const offY = Math.round((el.offsetY || 0) * (scale / 3.78));
    const elementY = currentY + offY;

    switch (el.type) {
      case 'storeName': {
        ctx.font = `900 ${fontSizePx}px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`;
        ctx.fillStyle = '#000000';

        const storeText = (el.content || template.config.storeNameText || 'ALPAMIS').toUpperCase();
        let drawX = padX + offX;
        if (el.textAlign === 'center') {
          drawX = widthPx / 2 + offX;
          ctx.textAlign = 'center';
        } else if (el.textAlign === 'right') {
          drawX = widthPx - padX + offX;
          ctx.textAlign = 'right';
        } else {
          ctx.textAlign = 'left';
        }

        ctx.fillText(storeText, drawX, elementY + fontSizePx * 0.85);

        if (el.borderBottom) {
          ctx.lineWidth = Math.max(1, Math.round(scale * 0.25));
          ctx.strokeStyle = 'rgba(0,0,0,0.25)';
          ctx.beginPath();
          ctx.moveTo(padX, elementY + fontSizePx + 2);
          ctx.lineTo(widthPx - padX, elementY + fontSizePx + 2);
          ctx.stroke();
        }

        currentY += itemM.height + gapBetween;
        break;
      }

      case 'productName': {
        const fontWeight = el.fontWeight === 'black' ? 900 : el.fontWeight === 'normal' ? 400 : 700;
        ctx.font = `${fontWeight} ${fontSizePx}px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`;
        ctx.fillStyle = '#000000';

        const lines = itemM.lines || [item.name];
        const lineHeight = fontSizePx * 1.15;

        for (let i = 0; i < lines.length; i++) {
          let drawX = padX + offX;
          if (el.textAlign === 'center') {
            drawX = widthPx / 2 + offX;
            ctx.textAlign = 'center';
          } else if (el.textAlign === 'right') {
            drawX = widthPx - padX + offX;
            ctx.textAlign = 'right';
          } else {
            ctx.textAlign = 'left';
          }
          ctx.fillText(lines[i], drawX, elementY + (i + 0.85) * lineHeight);
        }

        currentY += itemM.height + gapBetween;
        break;
      }

      case 'price': {
        const priceStr = item.price.toLocaleString('ru-RU');
        const currStr = (el.currencySymbol || template.config.currencySymbol || 'сум').toUpperCase();

        if (el.borderBottom) {
          ctx.lineWidth = Math.max(1, Math.round(scale * 0.2));
          ctx.strokeStyle = 'rgba(0,0,0,0.25)';
          ctx.beginPath();
          ctx.moveTo(padX, elementY);
          ctx.lineTo(widthPx - padX, elementY);
          ctx.stroke();
        }

        const priceBaseY = elementY + fontSizePx * 0.95 + (el.borderBottom ? 2 : 0);

        ctx.font = `900 ${fontSizePx}px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`;
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';

        const priceWidth = ctx.measureText(priceStr).width;
        let startX = padX + offX;

        if (el.textAlign === 'center') {
          startX = Math.max(padX, (widthPx - priceWidth - 40) / 2) + offX;
        } else if (el.textAlign === 'right') {
          startX = widthPx - padX - priceWidth - 50 + offX;
        }

        ctx.fillText(priceStr, startX, priceBaseY);

        const currFontSize = Math.round(fontSizePx * 0.42);
        ctx.font = `700 ${currFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`;
        ctx.fillText(currStr, startX + priceWidth + 5, priceBaseY - 1);

        if (el.showMeasure !== false) {
          const measureFontSize = Math.round(fontSizePx * 0.35);
          ctx.font = `600 ${measureFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`;
          const measureText = `за ${item.measureName || 'шт.'}`;
          const badgeW = ctx.measureText(measureText).width + 8;
          const badgeH = measureFontSize + 6;
          const badgeX = widthPx - padX - badgeW;
          const badgeY = priceBaseY - badgeH + 2;

          ctx.fillStyle = '#f1f5f9';
          ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
          ctx.strokeStyle = '#cbd5e1';
          ctx.strokeRect(badgeX, badgeY, badgeW, badgeH);

          ctx.fillStyle = '#334155';
          ctx.fillText(measureText, badgeX + 4, badgeY + badgeH - 4);
        }

        if (el.borderBottom) {
          ctx.lineWidth = Math.max(1, Math.round(scale * 0.2));
          ctx.strokeStyle = 'rgba(0,0,0,0.25)';
          ctx.beginPath();
          ctx.moveTo(padX, priceBaseY + 4);
          ctx.lineTo(widthPx - padX, priceBaseY + 4);
          ctx.stroke();
        }

        currentY += itemM.height + gapBetween;
        break;
      }

      case 'oldPrice': {
        ctx.font = `500 ${fontSizePx}px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`;
        ctx.fillStyle = '#64748b';

        const oldPriceVal = el.oldPriceValue || Math.round(item.price * 1.25);
        const prefix = el.prefix || '';
        const suffix = el.suffix || '';
        const oldPriceFormatted = `${oldPriceVal.toLocaleString('ru-RU')}`;
        const fullText = `${prefix}${oldPriceFormatted}${suffix}`;

        let drawX = padX + offX;
        if (el.textAlign === 'center') {
          drawX = widthPx / 2 + offX;
          ctx.textAlign = 'center';
        } else if (el.textAlign === 'right') {
          drawX = widthPx - padX + offX;
          ctx.textAlign = 'right';
        } else {
          ctx.textAlign = 'left';
        }

        const textY = elementY + fontSizePx * 0.85;
        ctx.fillText(fullText, drawX, textY);

        const fullWidth = ctx.measureText(fullText).width;
        let lineStartX = drawX;
        if (ctx.textAlign === 'center') lineStartX = drawX - fullWidth / 2;
        if (ctx.textAlign === 'right') lineStartX = drawX - fullWidth;

        ctx.lineWidth = Math.max(1, Math.round(scale * 0.18));
        ctx.strokeStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(lineStartX, textY - fontSizePx * 0.35);
        ctx.lineTo(lineStartX + fullWidth, textY - fontSizePx * 0.35);
        ctx.stroke();

        currentY += itemM.height + gapBetween;
        break;
      }

      case 'discountBadge': {
        ctx.font = `900 ${fontSizePx}px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`;
        const text = (el.content || '★ АКЦИЯ -20% ★').toUpperCase();
        const textW = ctx.measureText(text).width;

        const badgeW = textW + 12;
        const badgeH = fontSizePx + 6;
        let badgeX = padX + offX;
        if (el.textAlign === 'center') badgeX = (widthPx - badgeW) / 2 + offX;
        if (el.textAlign === 'right') badgeX = widthPx - padX - badgeW + offX;

        if (el.inverted) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(badgeX, elementY, badgeW, badgeH);
          ctx.fillStyle = '#ffffff';
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(badgeX, elementY, badgeW, badgeH);
          ctx.lineWidth = Math.max(1, Math.round(scale * 0.2));
          ctx.strokeStyle = '#000000';
          ctx.strokeRect(badgeX, elementY, badgeW, badgeH);
          ctx.fillStyle = '#000000';
        }

        ctx.textAlign = 'center';
        ctx.fillText(text, badgeX + badgeW / 2, elementY + badgeH - 4);

        currentY += itemM.height + gapBetween;
        break;
      }

      case 'barcode': {
        const rawH = Math.min(36, Math.max(14, (el.barcodeHeight || 45) / 2.4));
        const barcodeH = Math.round(rawH * (scale / 3.78));
        const digits = item.barcode || '4780111550194';

        const barcodeW = Math.round(contentWidth * 0.75);
        const startX = (widthPx - barcodeW) / 2 + offX;

        drawBarcodeLines(ctx, startX, elementY, barcodeW, barcodeH, digits);

        if (el.showBarcodeDigits !== false) {
          const fontSz = Math.round(8.5 * (scale / 3.2));
          ctx.font = `700 ${fontSz}px "Courier New", Courier, monospace`;
          ctx.fillStyle = '#0f172a';
          ctx.textAlign = 'center';
          ctx.fillText(digits, widthPx / 2 + offX, elementY + barcodeH + fontSz + 1);
        }

        currentY += itemM.height + gapBetween;
        break;
      }

      case 'divider': {
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.moveTo(padX, elementY + 2);
        ctx.lineTo(widthPx - padX, elementY + 2);
        ctx.stroke();

        currentY += itemM.height + gapBetween;
        break;
      }

      case 'productCode':
      case 'country':
      case 'date':
      case 'customText':
      default: {
        const fontWeight = el.fontWeight === 'black' ? 900 : el.fontWeight === 'bold' ? 700 : 500;
        ctx.font = `${fontWeight} ${fontSizePx}px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`;
        ctx.fillStyle = el.type === 'country' ? '#475569' : '#000000';

        let text = el.content || '';
        if (el.type === 'productCode') text = item.barcode.slice(-5);
        if (el.type === 'country') text = el.content || 'Узбекистан';
        if (el.type === 'date') text = currentDate;

        const fullText = `${el.prefix || ''}${text}${el.suffix || ''}`;
        const finalText = el.textTransform === 'uppercase' ? fullText.toUpperCase() : fullText;

        let drawX = padX + offX;
        if (el.textAlign === 'center') {
          drawX = widthPx / 2 + offX;
          ctx.textAlign = 'center';
        } else if (el.textAlign === 'right') {
          drawX = widthPx - padX + offX;
          ctx.textAlign = 'right';
        } else {
          ctx.textAlign = 'left';
        }

        ctx.fillText(finalText, drawX, elementY + fontSizePx * 0.85);
        currentY += itemM.height + gapBetween;
        break;
      }
    }
  }

  return canvas;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number = 2
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = ctx.measureText(testLine).width;

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
      if (lines.length === maxLines - 1) {
        break;
      }
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  return lines;
}

function drawBarcodeLines(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  digits: string
) {
  const seed = digits.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const numBars = 34;
  const barWidth = width / numBars;

  ctx.fillStyle = '#000000';

  for (let i = 0; i < numBars; i++) {
    const isBar = (i * seed + i * 7) % 3 !== 0;
    if (isBar) {
      const isThick = i % 5 === 0;
      const w = isThick ? barWidth * 1.6 : barWidth * 0.9;
      ctx.fillRect(Math.round(x + i * barWidth), y, Math.ceil(w), height);
    }
  }
}

export async function generateLabelsPdf({
  template,
  items,
}: GeneratePdfOptions): Promise<jsPDF> {
  const widthMm = template.widthMm || 58;
  const heightMm = template.heightMm || 40;

  const doc = new jsPDF({
    orientation: widthMm > heightMm ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [widthMm, heightMm],
    compress: true,
  });

  let isFirstPage = true;

  for (const item of items) {
    const copies = item.quantity || 1;
    const canvas = drawLabelOnCanvas(template, item, 8);
    const pngDataUrl = canvas.toDataURL('image/png', 1.0);

    for (let c = 0; c < copies; c++) {
      if (!isFirstPage) {
        doc.addPage([widthMm, heightMm], widthMm > heightMm ? 'landscape' : 'portrait');
      }
      doc.addImage(pngDataUrl, 'PNG', 0, 0, widthMm, heightMm);
      isFirstPage = false;
    }
  }

  return doc;
}

export async function downloadLabelsPdf(options: GeneratePdfOptions, filename?: string): Promise<void> {
  const doc = await generateLabelsPdf(options);
  const fname = filename || `ценники_${options.template.widthMm}x${options.template.heightMm}мм.pdf`;
  doc.save(fname);
}

export async function openLabelsPdfInNewTab(options: GeneratePdfOptions): Promise<void> {
  const doc = await generateLabelsPdf(options);
  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, '_blank');
}

/**
 * Нативная печать ценников через системный диалог Windows / браузера.
 * Использует точную HTML верстку этикеток с CSS Flexbox justify-between,
 * благодаря чему ценники в окне печати 1 в 1 совпадают с превью на экране.
 */
export function printViaBrowser(template: PrintTemplate, items: PrintJobItem[]): void {
  const widthMm = template.widthMm || 58;
  const heightMm = template.heightMm || 40;
  const isRotated = template.config.direction === 1;
  const borderStyle = template.config.showBorder
    ? `border: ${template.config.borderWidth || 1}px solid #000000;`
    : '';

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  let pagesHtml = '';

  for (const item of items) {
    const copies = item.quantity || 1;
    const labelContent = renderLabelHtml(template, item);

    for (let c = 0; c < copies; c++) {
      pagesHtml += `
        <div class="label-page">
          ${labelContent}
        </div>
      `;
    }
  }

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Печать ценников ${widthMm}x${heightMm}мм</title>
        <style>
          @page {
            size: ${widthMm}mm ${heightMm}mm;
            margin: 0;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .label-page {
            width: ${widthMm}mm;
            height: ${heightMm}mm;
            page-break-after: always;
            break-after: page;
            page-break-inside: avoid;
            break-inside: avoid;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 8px; /* 8px совпадает с p-2 в LabelLivePreview */
            background: #ffffff;
            color: #000000;
            position: relative;
            box-sizing: border-box;
            ${borderStyle}
            ${isRotated ? 'transform: rotate(180deg);' : ''}
          }
        </style>
      </head>
      <body>
        ${pagesHtml}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.focus();
              window.print();
            }, 150);
          };
        </script>
      </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }
  }, 60000);
}
