import { jsPDF } from 'jspdf';
import JsBarcode from 'jsbarcode';
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
          // Весовой товар — показываем крупный PLU вместо штрихкода
          if (item.isWeight && item.plu) {
            const pluFontSize = Math.round((el.barcodeHeight || 45) / 3.2);
            return `
              <div style="width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 2px 0; padding: 2px 0; ${transformStyle}">
                <span style="font-size: 7px; font-family: monospace; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 2px; line-height: 1;">PLU КОД</span>
                <div style="border: 2px solid #000000; border-radius: 4px; padding: 2px 10px; display: inline-flex; align-items: center; justify-content: center;">
                  <span style="font-size: ${pluFontSize}pt; font-family: monospace; font-weight: 900; color: #000000; letter-spacing: 0.2em; line-height: 1;">${escapeHtml(item.plu)}</span>
                </div>
              </div>
            `;
          }

          const rawH = Math.min(36, Math.max(16, (el.barcodeHeight || 45) / 2.2));
          let svgMarkup = '';
          const clean = String(item.barcode || '4780111550194').trim();
          if (typeof document !== 'undefined') {
            try {
              const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
              const format = /^\d{12,13}$/.test(clean) ? 'EAN13' : 'CODE128';
              try {
                JsBarcode(svg, clean, {
                  format,
                  width: 2,
                  height: rawH,
                  displayValue: el.showBarcodeDigits !== false,
                  fontSize: 10,
                  font: 'monospace',
                  margin: 0,
                  background: 'transparent',
                  lineColor: '#000000',
                });
              } catch {
                JsBarcode(svg, clean, {
                  format: 'CODE128',
                  width: 2,
                  height: rawH,
                  displayValue: el.showBarcodeDigits !== false,
                  fontSize: 10,
                  font: 'monospace',
                  margin: 0,
                  background: 'transparent',
                  lineColor: '#000000',
                });
              }
              svgMarkup = svg.outerHTML;
            } catch {}
          }
          return `
            <div style="width: 100%; display: flex; flex-direction: column; align-items: center; margin-top: 2px; ${transformStyle}">
              ${svgMarkup}
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
          const isWeight = item.isWeight;
          const showPlu = isWeight && item.plu;

          if (showPlu) {
            return `
              <div style="width: 100%; font-size: ${fontSize}pt; font-weight: 700; text-align: ${align}; color: #000000; ${transformStyle}">
                <span style="color: #64748b; font-weight: 500;">PLU: </span>${escapeHtml(item.plu!)}
              </div>
            `;
          }

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

        case 'qrcode': {
          const qrSize = el.qrSize || 36;
          const align = el.textAlign || 'center';
          const justify = align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start';
          return `
            <div style="width: 100%; display: flex; justify-content: ${justify}; margin: 2px 0; ${transformStyle}">
              <div style="padding: 2px; border: 1px solid #cbd5e1; border-radius: 4px; background: #ffffff; display: inline-block;">
                <svg width="${qrSize}" height="${qrSize}" viewBox="0 0 21 21" shape-rendering="crispEdges">
                  <rect width="21" height="21" fill="#ffffff" />
                  <path fill="#000000" d="M0 0h7v7H0zM1 1h5v5H1zM2 2h3v3H2zM14 0h7v7h-7zM15 1h5v5h-5zM16 2h3v3h-3zM0 14h7v7H0zM1 15h5v5H1zM2 16h3v3H2zM8 2h1v1H8zM10 2h1v1h-1zM12 2h1v1h-1zM8 4h1v1H8zM12 4h1v1h-1zM8 8h1v1H8zM9 9h1v1H9zM10 10h1v1h-1zM11 11h1v1h-1zM12 8h1v1h-1zM8 12h1v1H8zM10 12h1v1h-1zM12 12h1v1h-1zM14 8h1v1h-1zM16 8h1v1h-1zM18 8h1v1h-1zM20 8h1v1h-1zM14 10h1v1h-1zM16 10h1v1h-1zM18 10h1v1h-1zM20 10h1v1h-1zM14 12h1v1h-1zM16 12h1v1h-1zM18 12h1v1h-1zM20 12h1v1h-1zM8 14h1v1H8zM10 14h1v1h-1zM12 14h1v1h-1zM8 16h1v1H8zM10 16h1v1h-1zM12 16h1v1h-1zM8 18h1v1H8zM10 18h1v1h-1zM12 18h1v1h-1zM8 20h1v1H8zM10 20h1v1h-1zM12 20h1v1h-1zM14 14h7v7h-7z" />
                </svg>
              </div>
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
 * Отрисовка этикетки на Canvas для экспорта в PDF и точной печати через браузер.
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

  // Обработка поворота на 180°
  const isRotated = template.config.direction === 1;
  if (isRotated) {
    ctx.save();
    ctx.translate(widthPx, heightPx);
    ctx.rotate(Math.PI);
  }

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
        const rawH = Math.min(36, Math.max(16, (el.barcodeHeight || 45) / 2.2));
        const barcodeH = Math.round(rawH * (scale / 3.78));
        const fontSizePx = Math.round(8.5 * (scale / 2.83));
        const digitsH = el.showBarcodeDigits !== false ? fontSizePx + 4 : 0;
        measured.push({ el, height: barcodeH + digitsH, fontSizePx: 0 });
        break;
      }
      case 'qrcode': {
        const qrSize = Math.round((el.qrSize || 32) * (scale / 3.5));
        measured.push({ el, height: qrSize + 4, fontSizePx: 0 });
        break;
      }
      case 'divider': {
        const lineThick = Math.max(1, Math.round((el.borderWidth || 1) * (scale * 0.25)));
        measured.push({ el, height: lineThick + 4, fontSizePx: 0 });
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
  const gapBetween = measured.length > 1 ? Math.max(2, availableSpace / numGaps) : 2;

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
        // Весовой товар — рисуем крупный PLU вместо штрихкода
        if (item.isWeight && item.plu) {
          const pluLabelFontSizePx = Math.round(6 * (scale / 2.83));
          const pluNumFontSizePx = Math.round((el.barcodeHeight || 45) / 3.2 * (scale / 2.83));

          // Подпись «PLU КОД»
          ctx.font = `500 ${pluLabelFontSizePx}px monospace`;
          ctx.fillStyle = '#9ca3af';
          ctx.textAlign = 'center';
          ctx.fillText('PLU КОД', widthPx / 2 + offX, elementY + pluLabelFontSizePx);

          // Сам PLU номер крупно
          ctx.font = `900 ${pluNumFontSizePx}px monospace`;
          ctx.fillStyle = '#000000';
          const pluTextY = elementY + pluLabelFontSizePx + pluNumFontSizePx + 4;
          ctx.fillText(item.plu, widthPx / 2 + offX, pluTextY);

          // Рамка вокруг PLU
          const pluW = ctx.measureText(item.plu).width + Math.round(16 * (scale / 3.78));
          const pluH = pluNumFontSizePx + Math.round(6 * (scale / 3.78));
          const boxX = (widthPx - pluW) / 2 + offX;
          const boxY = pluTextY - pluNumFontSizePx - Math.round(3 * (scale / 3.78));
          ctx.lineWidth = Math.max(1, Math.round(1.5 * (scale / 3.78)));
          ctx.strokeStyle = '#000000';
          ctx.beginPath();
          ctx.roundRect(boxX, boxY, pluW, pluH, Math.round(3 * (scale / 3.78)));
          ctx.stroke();

          currentY += itemM.height + gapBetween;
          break;
        }

        const rawH = Math.min(36, Math.max(16, (el.barcodeHeight || 45) / 2.2));
        const barcodeH = Math.round(rawH * (scale / 3.78));
        const cleanDigits = String(item.barcode || '4780111550194').trim();

        // barWidth: модуль штрихкода для термопринтера (203 DPI)
        // Для EAN-13 ширина ~115 модулей: при ширине 2px получаем 230px (~28.75мм)
        const barWidth = Math.max(1, Math.min(3, Math.floor(contentWidth / 115)));
        const fontSizePx = Math.round(8.5 * (scale / 2.83));

        const barcodeCanvas = document.createElement('canvas');
        let rendered = false;

        // Попытка EAN13 для 12-13 значных штрихкодов
        if (/^\d{12,13}$/.test(cleanDigits)) {
          try {
            JsBarcode(barcodeCanvas, cleanDigits, {
              format: 'EAN13',
              width: barWidth,
              height: barcodeH,
              displayValue: el.showBarcodeDigits !== false,
              fontSize: fontSizePx,
              font: 'monospace',
              margin: 0,
              background: '#ffffff',
              lineColor: '#000000',
            });
            rendered = true;
          } catch {
            // если EAN13 с ошибкой контрольной суммы, фоллбек на CODE128
          }
        }

        // Универсальный фоллбек на CODE128
        if (!rendered) {
          try {
            JsBarcode(barcodeCanvas, cleanDigits, {
              format: 'CODE128',
              width: Math.max(1, Math.min(2, Math.floor(contentWidth / 130))),
              height: barcodeH,
              displayValue: el.showBarcodeDigits !== false,
              fontSize: fontSizePx,
              font: 'monospace',
              margin: 0,
              background: '#ffffff',
              lineColor: '#000000',
            });
            rendered = true;
          } catch (err) {
            console.error('Barcode error', err);
          }
        }

        if (rendered && barcodeCanvas.width > 0) {
          const drawX = Math.round((widthPx - barcodeCanvas.width) / 2) + offX;
          ctx.drawImage(barcodeCanvas, drawX, elementY);
        }

        currentY += itemM.height + gapBetween;
        break;
      }

      case 'qrcode': {
        const qrSize = Math.round((el.qrSize || 32) * (scale / 3.5));
        let qrX = padX + offX;
        if (el.textAlign === 'center') qrX = (widthPx - qrSize) / 2 + offX;
        if (el.textAlign === 'right') qrX = widthPx - padX - qrSize + offX;

        drawQrMatrix(ctx, qrX, elementY, qrSize);
        currentY += itemM.height + gapBetween;
        break;
      }

      case 'divider': {
        const lineThick = Math.max(1, Math.round((el.borderWidth || 1) * (scale * 0.25)));
        ctx.lineWidth = lineThick;
        ctx.strokeStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.moveTo(padX, elementY + 2);
        ctx.lineTo(widthPx - padX, elementY + 2);
        ctx.stroke();

        currentY += itemM.height + gapBetween;
        break;
      }

      case 'productCode': {
        const fontWeight = el.fontWeight === 'black' ? 900 : el.fontWeight === 'bold' ? 700 : 500;
        ctx.font = `${fontWeight} ${fontSizePx}px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`;

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

        const textBaseY = elementY + fontSizePx * 0.85;

        if (item.isWeight && item.plu) {
          // Для весового товара: PLU-код
          ctx.fillStyle = '#64748b';
          ctx.fillText('PLU: ', drawX, textBaseY);
          const prefixW = ctx.measureText('PLU: ').width;
          const pluX = ctx.textAlign === 'left' ? drawX + prefixW : drawX;
          ctx.fillStyle = '#000000';
          ctx.font = `700 ${fontSizePx}px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`;
          ctx.fillText(item.plu, pluX, textBaseY);
        } else {
          // Обычный артикул
          const code = el.content || item.barcode.slice(-5);
          const fullText = `${el.prefix || 'Арт: '}${code}${el.suffix || ''}`;
          ctx.fillStyle = '#000000';
          ctx.fillText(fullText, drawX, textBaseY);
        }

        currentY += itemM.height + gapBetween;
        break;
      }

      case 'country':
      case 'date':
      case 'customText':
      default: {
        const fontWeight = el.fontWeight === 'black' ? 900 : el.fontWeight === 'bold' ? 700 : 500;
        ctx.font = `${fontWeight} ${fontSizePx}px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`;
        ctx.fillStyle = el.type === 'country' ? '#475569' : '#000000';

        let text = el.content || '';
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

  if (isRotated) {
    ctx.restore();
  }

  return canvas;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number = 2
): string[] {
  if (!text) return [];
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


function drawQrMatrix(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const cellSize = size / 21;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, size, size);

  ctx.fillStyle = '#000000';

  const drawFinder = (fx: number, fy: number) => {
    ctx.fillRect(fx, fy, cellSize * 7, cellSize * 7);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(fx + cellSize, fy + cellSize, cellSize * 5, cellSize * 5);
    ctx.fillStyle = '#000000';
    ctx.fillRect(fx + cellSize * 2, fy + cellSize * 2, cellSize * 3, cellSize * 3);
  };

  drawFinder(x, y);
  drawFinder(x + cellSize * 14, y);
  drawFinder(x, y + cellSize * 14);

  for (let i = 8; i < 13; i += 2) {
    ctx.fillRect(x + i * cellSize, y + 6 * cellSize, cellSize, cellSize);
    ctx.fillRect(x + 6 * cellSize, y + i * cellSize, cellSize, cellSize);
  }

  for (let r = 8; r < 20; r++) {
    for (let c = 8; c < 20; c++) {
      if ((r * 7 + c * 13) % 2 === 0) {
        ctx.fillRect(x + c * cellSize, y + r * cellSize, cellSize, cellSize);
      }
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
 * Использует ту же canvas-отрисовку высокой четкости (203 DPI), что и экспорт в PDF,
 * гарантируя 100% визуальную и размерную идентичность ценников между печатью через сервис и печатью через браузер.
 */
export function printViaBrowser(template: PrintTemplate, items: PrintJobItem[]): void {
  const widthMm = template.widthMm || 58;
  const heightMm = template.heightMm || 40;

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
    const canvas = drawLabelOnCanvas(template, item, 8);
    const dataUrl = canvas.toDataURL('image/png', 1.0);

    for (let c = 0; c < copies; c++) {
      pagesHtml += `
        <div class="label-page">
          <img src="${dataUrl}" alt="Label" />
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
            align-items: center;
            justify-content: center;
            background: #ffffff;
          }
          img {
            width: ${widthMm}mm;
            height: ${heightMm}mm;
            display: block;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
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
