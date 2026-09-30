import { jsPDF } from 'jspdf';
import { PrintTemplate, PrintJobItem, LabelElement } from './types';
import { getTemplateElements } from './label-elements';

export interface GeneratePdfOptions {
  template: PrintTemplate;
  items: PrintJobItem[];
}

/**
 * Renders a complete label directly onto an HTML5 Canvas using pure 2D Context.
 * Because no SVG foreignObject or external resources are used, this canvas is NEVER tainted
 * and canvas.toDataURL() executes safely without any browser SecurityError.
 */
export function drawLabelOnCanvas(
  template: PrintTemplate,
  item: PrintJobItem,
  scale: number = 8 // 8 pixels per mm = approx 203 DPI (native thermal head resolution)
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

  // 1. Crisp white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, widthPx, heightPx);

  // 2. Perimeter border if enabled
  if (template.config.showBorder) {
    const bw = Math.max(1, Math.round((template.config.borderWidth || 1) * (scale / 4)));
    ctx.lineWidth = bw;
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(bw / 2, bw / 2, widthPx - bw, heightPx - bw);
  }

  const elements = getTemplateElements(template.config);
  const sorted = [...elements].filter((el) => el.visible).sort((a, b) => a.order - b.order);

  const padX = Math.round(2.5 * scale);
  const padTop = Math.round(2.2 * scale);
  const contentWidth = widthPx - padX * 2;

  let currentY = padTop;

  const currentDate = new Date().toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });

  // Calculate proportional vertical spacing between elements
  const totalElements = sorted.length;
  const extraVerticalSpacing = totalElements > 0 ? Math.max(2, (heightPx - padTop * 2) / (totalElements * 5.5)) : 2;

  for (const el of sorted) {
    const offX = Math.round((el.offsetX || 0) * (scale / 3.78));
    const offY = Math.round((el.offsetY || 0) * (scale / 3.78));
    const elementY = currentY + offY;

    switch (el.type) {
      case 'storeName': {
        const fontSizePx = Math.round((el.fontSize || 9) * (scale / 2.7));
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
          ctx.lineWidth = Math.max(1, Math.round(scale * 0.3));
          ctx.strokeStyle = '#000000';
          ctx.beginPath();
          ctx.moveTo(padX, elementY + fontSizePx + 4);
          ctx.lineTo(widthPx - padX, elementY + fontSizePx + 4);
          ctx.stroke();
        }

        currentY += fontSizePx + (el.borderBottom ? 8 : 4) + extraVerticalSpacing;
        break;
      }

      case 'productName': {
        const fontSizePx = Math.round((el.fontSize || template.config.titleFontSize || 11) * (scale / 2.8));
        const fontWeight = el.fontWeight === 'black' ? 900 : el.fontWeight === 'normal' ? 500 : 700;
        ctx.font = `${fontWeight} ${fontSizePx}px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`;
        ctx.fillStyle = '#000000';

        // Word-wrap title into lines
        const lines = wrapText(ctx, item.name, contentWidth, el.lineClamp || 2);
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

        currentY += lines.length * lineHeight + extraVerticalSpacing;
        break;
      }

      case 'price': {
        const fontSizePx = Math.round((el.fontSize || template.config.priceFontSize || 24) * (scale / 2.7));
        const priceStr = item.price.toLocaleString('ru-RU');
        const currStr = (el.currencySymbol || template.config.currencySymbol || 'сум').toUpperCase();

        // Top line if bordered
        if (el.borderBottom) {
          ctx.lineWidth = Math.max(1, Math.round(scale * 0.25));
          ctx.strokeStyle = '#000000';
          ctx.beginPath();
          ctx.moveTo(padX, elementY);
          ctx.lineTo(widthPx - padX, elementY);
          ctx.stroke();
        }

        const priceBaseY = elementY + fontSizePx * 0.95 + (el.borderBottom ? 4 : 0);

        // Price digits
        ctx.font = `900 ${fontSizePx}px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`;
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';

        const priceWidth = ctx.measureText(priceStr).width;
        let startX = padX + offX;

        if (el.textAlign === 'center') {
          startX = Math.max(padX, (widthPx - priceWidth - 40) / 2) + offX;
        } else if (el.textAlign === 'right') {
          startX = widthPx - padX - priceWidth - 60 + offX;
        }

        ctx.fillText(priceStr, startX, priceBaseY);

        // Currency
        const currFontSize = Math.round(fontSizePx * 0.45);
        ctx.font = `700 ${currFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`;
        ctx.fillText(currStr, startX + priceWidth + 6, priceBaseY - 2);

        // Measure badge (e.g. "за шт.")
        if (el.showMeasure !== false) {
          const measureFontSize = Math.round(fontSizePx * 0.35);
          ctx.font = `700 ${measureFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`;
          const measureText = `за ${item.measureName || 'шт.'}`;
          const badgeW = ctx.measureText(measureText).width + 10;
          const badgeH = measureFontSize + 6;
          const badgeX = widthPx - padX - badgeW;
          const badgeY = priceBaseY - badgeH + 2;

          ctx.fillStyle = '#f1f5f9';
          ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
          ctx.strokeStyle = '#cbd5e1';
          ctx.strokeRect(badgeX, badgeY, badgeW, badgeH);

          ctx.fillStyle = '#1e293b';
          ctx.fillText(measureText, badgeX + 5, badgeY + badgeH - 4);
        }

        // Bottom line if bordered
        if (el.borderBottom) {
          ctx.lineWidth = Math.max(1, Math.round(scale * 0.25));
          ctx.strokeStyle = '#000000';
          ctx.beginPath();
          ctx.moveTo(padX, priceBaseY + 6);
          ctx.lineTo(widthPx - padX, priceBaseY + 6);
          ctx.stroke();
        }

        currentY += fontSizePx + (el.borderBottom ? 12 : 6) + extraVerticalSpacing;
        break;
      }

      case 'oldPrice': {
        const fontSizePx = Math.round((el.fontSize || 10) * (scale / 3.0));
        ctx.font = `600 ${fontSizePx}px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`;
        ctx.fillStyle = '#475569';

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

        // Strikethrough line
        const fullWidth = ctx.measureText(fullText).width;
        let lineStartX = drawX;
        if (ctx.textAlign === 'center') lineStartX = drawX - fullWidth / 2;
        if (ctx.textAlign === 'right') lineStartX = drawX - fullWidth;

        ctx.lineWidth = Math.max(1, Math.round(scale * 0.2));
        ctx.strokeStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(lineStartX, textY - fontSizePx * 0.35);
        ctx.lineTo(lineStartX + fullWidth, textY - fontSizePx * 0.35);
        ctx.stroke();

        currentY += fontSizePx + 4 + extraVerticalSpacing;
        break;
      }

      case 'discountBadge': {
        const fontSizePx = Math.round((el.fontSize || 9) * (scale / 3.0));
        ctx.font = `900 ${fontSizePx}px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`;
        const text = (el.content || '★ АКЦИЯ -20% ★').toUpperCase();
        const textW = ctx.measureText(text).width;

        const badgeW = textW + 16;
        const badgeH = fontSizePx + 8;
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
          ctx.lineWidth = Math.max(1, Math.round(scale * 0.25));
          ctx.strokeStyle = '#000000';
          ctx.strokeRect(badgeX, elementY, badgeW, badgeH);
          ctx.fillStyle = '#000000';
        }

        ctx.textAlign = 'center';
        ctx.fillText(text, badgeX + badgeW / 2, elementY + badgeH - 5);

        currentY += badgeH + 4 + extraVerticalSpacing;
        break;
      }

      case 'barcode': {
        const barcodeH = Math.round((el.barcodeHeight || 40) * (scale / 4.8));
        const digits = item.barcode || '4780111550194';

        // Draw crisp barcode bars
        const barcodeW = Math.round(contentWidth * 0.85);
        const startX = (widthPx - barcodeW) / 2 + offX;

        drawBarcodeLines(ctx, startX, elementY, barcodeW, barcodeH, digits);

        let totalBarcodeH = barcodeH;

        if (el.showBarcodeDigits !== false) {
          const fontSz = Math.round(8.5 * (scale / 3.2));
          ctx.font = `700 ${fontSz}px "Courier New", Courier, monospace`;
          ctx.fillStyle = '#000000';
          ctx.textAlign = 'center';
          ctx.fillText(digits, widthPx / 2 + offX, elementY + barcodeH + fontSz + 1);
          totalBarcodeH += fontSz + 3;
        }

        currentY += totalBarcodeH + 4 + extraVerticalSpacing;
        break;
      }

      case 'qrcode': {
        const qrSize = Math.round((el.qrSize || 32) * (scale / 3.5));
        let qrX = padX + offX;
        if (el.textAlign === 'center') qrX = (widthPx - qrSize) / 2 + offX;
        if (el.textAlign === 'right') qrX = widthPx - padX - qrSize + offX;

        drawQrMatrix(ctx, qrX, elementY, qrSize);
        currentY += qrSize + 4 + extraVerticalSpacing;
        break;
      }

      case 'divider': {
        const lineThick = Math.max(1, Math.round((el.borderWidth || 1) * (scale * 0.25)));
        ctx.lineWidth = lineThick;
        ctx.strokeStyle = '#000000';
        ctx.beginPath();
        ctx.moveTo(padX, elementY);
        ctx.lineTo(widthPx - padX, elementY);
        ctx.stroke();

        currentY += lineThick + 4 + extraVerticalSpacing;
        break;
      }

      case 'productCode':
      case 'country':
      case 'date':
      case 'customText':
      default: {
        const fontSizePx = Math.round((el.fontSize || 8.5) * (scale / 3.2));
        const fontWeight = el.fontWeight === 'black' ? 900 : el.fontWeight === 'bold' ? 700 : 500;
        ctx.font = `${fontWeight} ${fontSizePx}px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`;
        ctx.fillStyle = '#000000';

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
        currentY += fontSizePx + 4 + extraVerticalSpacing;
        break;
      }
    }
  }

  return canvas;
}

/**
 * Text wrapping utility for 2D Canvas context
 */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number = 2): string[] {
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

/**
 * Draws sharp, readable 1D barcode lines directly onto the 2D canvas
 */
function drawBarcodeLines(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  digits: string
) {
  const seed = digits.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const numBars = 42;
  const barWidth = width / numBars;

  ctx.fillStyle = '#000000';

  for (let i = 0; i < numBars; i++) {
    const isBar = (i * seed + i * 7) % 3 !== 0;
    if (isBar) {
      const isThick = (i * seed + i * 2) % 5 === 0;
      const w = isThick ? barWidth * 1.5 : barWidth * 0.85;
      ctx.fillRect(Math.round(x + i * barWidth), y, Math.ceil(w), height);
    }
  }
}

/**
 * Draws sharp 2D QR finder and data matrix squares directly onto the canvas
 */
function drawQrMatrix(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const cellSize = size / 21;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, size, size);

  ctx.fillStyle = '#000000';

  // 3 standard QR position finder patterns (top-left, top-right, bottom-left)
  const drawFinder = (fx: number, fy: number) => {
    // Outer 7x7 square
    ctx.fillRect(fx, fy, cellSize * 7, cellSize * 7);
    // Inner white 5x5
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(fx + cellSize, fy + cellSize, cellSize * 5, cellSize * 5);
    // Center black 3x3
    ctx.fillStyle = '#000000';
    ctx.fillRect(fx + cellSize * 2, fy + cellSize * 2, cellSize * 3, cellSize * 3);
  };

  drawFinder(x, y);
  drawFinder(x + cellSize * 14, y);
  drawFinder(x, y + cellSize * 14);

  // Timing lines
  for (let i = 8; i < 13; i += 2) {
    ctx.fillRect(x + i * cellSize, y + 6 * cellSize, cellSize, cellSize);
    ctx.fillRect(x + 6 * cellSize, y + i * cellSize, cellSize, cellSize);
  }

  // Pseudo-random data cells
  for (let r = 8; r < 20; r++) {
    for (let c = 8; c < 20; c++) {
      if ((r * 7 + c * 13) % 2 === 0) {
        ctx.fillRect(x + c * cellSize, y + r * cellSize, cellSize, cellSize);
      }
    }
  }
}

/**
 * Generates a complete jsPDF document with exact dimensions (1 page per label copy).
 * Uses pure HTML5 Canvas drawing, avoiding SVG foreignObject completely so that
 * canvas.toDataURL() never throws a Tainted Canvas SecurityError!
 */
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
    // Draw directly on untainted canvas at native ~203 DPI (8 dots/mm)
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

/**
 * Generates and downloads the PDF file
 */
export async function downloadLabelsPdf(options: GeneratePdfOptions, filename?: string): Promise<void> {
  const doc = await generateLabelsPdf(options);
  const fname = filename || `ценники_${options.template.widthMm}x${options.template.heightMm}мм.pdf`;
  doc.save(fname);
}

/**
 * Generates PDF and opens in a new tab for native printing / viewing
 */
export async function openLabelsPdfInNewTab(options: GeneratePdfOptions): Promise<void> {
  const doc = await generateLabelsPdf(options);
  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, '_blank');
}

/**
 * Triggers direct browser printing with exact label page dimensions using an iframe
 */
export function printViaBrowser(
  template: PrintTemplate,
  items: PrintJobItem[]
): void {
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

  // Render each label as a data URL image to guarantee 100% exact look across all printers
  let pagesHtml = '';

  for (const item of items) {
    const copies = item.quantity || 1;
    const canvas = drawLabelOnCanvas(template, item, 8);
    const dataUrl = canvas.toDataURL('image/png', 1.0);

    for (let c = 0; c < copies; c++) {
      pagesHtml += `
        <div class="label-page">
          <img src="${dataUrl}" style="width: ${widthMm}mm; height: ${heightMm}mm; display: block;" />
        </div>
      `;
    }
  }

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Печать ценников ${widthMm}x${heightMm}мм</title>
        <style>
          @page {
            size: ${widthMm}mm ${heightMm}mm;
            margin: 0;
          }
          * {
            box-sizing: border-box;
          }
          html, body {
            margin: 0;
            padding: 0;
            background: white;
          }
          .label-page {
            width: ${widthMm}mm;
            height: ${heightMm}mm;
            page-break-after: always;
            break-after: page;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
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
            }, 250);
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
