export type PictureLineWeight = 'thin' | 'medium' | 'thick';
export type PictureFormat = 'auto' | 'svg' | 'raster';

export interface ProcessOptions {
  maxSize?: number;
  format?: PictureFormat;
}

const MAX_SIZE = 1400;
const PADDING = 24;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    image.src = src;
  });
}

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D context unavailable');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  return canvas;
}

function drawContained(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
  padding: number,
) {
  const scale = Math.min(
    (width - padding * 2) / image.naturalWidth,
    (height - padding * 2) / image.naturalHeight,
  );
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  context.drawImage(
    image,
    (width - drawWidth) / 2,
    (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}

function cropToContent(canvas: HTMLCanvasElement): string {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D context unavailable');
  const width = canvas.width;
  const height = canvas.height;
  const data = context.getImageData(0, 0, width, height).data;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4] >= 128) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return canvas.toDataURL('image/png');

  const margin = Math.max(8, Math.round(Math.min(width, height) * 0.012));
  const cropX = Math.max(0, minX - margin);
  const cropY = Math.max(0, minY - margin);
  const cropWidth = Math.min(width, maxX + margin + 1) - cropX;
  const cropHeight = Math.min(height, maxY + margin + 1) - cropY;
  if (cropWidth >= width - 2 && cropHeight >= height - 2) {
    return canvas.toDataURL('image/png');
  }

  const output = createCanvas(cropWidth, cropHeight);
  const outputContext = output.getContext('2d');
  if (!outputContext) throw new Error('Canvas 2D context unavailable');
  outputContext.drawImage(canvas, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
  return output.toDataURL('image/png');
}

function strokeWidthFor(weight: PictureLineWeight, maxSize: number): number {
  const base = weight === 'thin' ? 1.2 : weight === 'thick' ? 3 : 2;
  return Math.max(0.9, base * Math.min(1, maxSize / 1000));
}

async function renderSvgOutline(
  src: string,
  weight: PictureLineWeight,
  maxSize: number,
): Promise<string | null> {
  let text: string;
  try {
    const response = await fetch(src);
    if (!response.ok) return null;
    text = await response.text();
  } catch {
    return null;
  }
  if (!/<svg[\s>]/i.test(text)) return null;
  // Embedded bitmaps cannot be outlined by CSS; use the raster path instead.
  if (/<image[\s>]/i.test(text)) return null;

  const strokeWidth = strokeWidthFor(weight, maxSize);
  const style = `<style>svg *{fill:none!important;stroke:#000000!important;stroke-width:${strokeWidth}px!important;stroke-linecap:round!important;stroke-linejoin:round!important;vector-effect:non-scaling-stroke!important;}</style>`;
  const patched = text.replace(/<\/svg\s*>/i, `${style}</svg>`);
  if (patched === text) return null;

  const blob = new Blob([patched], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  let image: HTMLImageElement;
  try {
    image = await loadImage(url);
  } finally {
    URL.revokeObjectURL(url);
  }
  if (!image.naturalWidth || !image.naturalHeight) return null;

  const scale = maxSize / Math.max(image.naturalWidth, image.naturalHeight);
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D context unavailable');
  drawContained(context, image, width, height, PADDING);

  const data = context.getImageData(0, 0, width, height).data;
  let dark = 0;
  for (let index = 0; index < width * height; index += 1) {
    if (data[index * 4] < 128) dark += 1;
  }
  if (dark < width * height * 0.00005) return null;
  return cropToContent(canvas);
}

function grayscale(data: Uint8ClampedArray, width: number, height: number): Float32Array {
  const gray = new Float32Array(width * height);
  for (let index = 0; index < width * height; index += 1) {
    const offset = index * 4;
    gray[index] = data[offset] * 0.299 + data[offset + 1] * 0.587 + data[offset + 2] * 0.114;
  }
  return gray;
}

function thresholdBinary(
  gray: Float32Array,
  threshold: number,
): Uint8Array {
  const binary = new Uint8Array(gray.length);
  for (let index = 0; index < gray.length; index += 1) {
    binary[index] = gray[index] < threshold ? 1 : 0;
  }
  return binary;
}

function edgeBinary(gray: Float32Array, width: number, height: number, threshold: number): Uint8Array {
  const binary = new Uint8Array(width * height);
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = y * width + x;
      const gx =
        -gray[index - width - 1] -
        2 * gray[index - 1] -
        gray[index + width - 1] +
        gray[index - width + 1] +
        2 * gray[index + 1] +
        gray[index + width + 1];
      const gy =
        -gray[index - width - 1] -
        2 * gray[index - width] -
        gray[index - width + 1] +
        gray[index + width - 1] +
        2 * gray[index + width] +
        gray[index + width + 1];
      if (Math.hypot(gx, gy) > threshold) binary[index] = 1;
    }
  }
  return binary;
}

function dilate(binary: Uint8Array, width: number, height: number, radius: number): Uint8Array {
  if (radius <= 0) return binary;
  const output = new Uint8Array(binary);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!binary[y * width + x]) continue;
      for (let dy = -radius; dy <= radius; dy += 1) {
        for (let dx = -radius; dx <= radius; dx += 1) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
          output[ny * width + nx] = 1;
        }
      }
    }
  }
  return output;
}

function binaryToCanvas(binary: Uint8Array, width: number, height: number): HTMLCanvasElement {
  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D context unavailable');
  const imageData = context.createImageData(width, height);
  for (let index = 0; index < width * height; index += 1) {
    const offset = index * 4;
    const value = binary[index] ? 0 : 255;
    imageData.data[offset] = value;
    imageData.data[offset + 1] = value;
    imageData.data[offset + 2] = value;
    imageData.data[offset + 3] = 255;
  }
  context.putImageData(imageData, 0, 0);
  return canvas;
}

async function renderRasterLineArt(
  src: string,
  weight: PictureLineWeight,
  maxSize: number,
): Promise<string> {
  const image = await loadImage(src);
  const scale = maxSize / Math.max(image.naturalWidth, image.naturalHeight);
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D context unavailable');
  drawContained(context, image, width, height, PADDING);

  const data = context.getImageData(0, 0, width, height).data;
  const gray = grayscale(data, width, height);
  let nearWhite = 0;
  let nearBlack = 0;
  let colored = 0;
  for (let index = 0; index < width * height; index += 1) {
    const offset = index * 4;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    if (r > 235 && g > 235 && b > 235) nearWhite += 1;
    if (r < 60 && g < 60 && b < 60) nearBlack += 1;
    if (Math.max(r, g, b) - Math.min(r, g, b) > 32) colored += 1;
  }
  const total = width * height;
  const lineArtLike = nearWhite / total > 0.55 && nearBlack / total > 0.002 && colored / total < 0.16;

  let binary: Uint8Array;
  if (lineArtLike) {
    const threshold = weight === 'thin' ? 110 : weight === 'thick' ? 190 : 150;
    binary = thresholdBinary(gray, threshold);
    binary = dilate(binary, width, height, weight === 'thick' ? 1 : 0);
  } else {
    const threshold = weight === 'thin' ? 72 : weight === 'thick' ? 34 : 50;
    binary = edgeBinary(gray, width, height, threshold);
    binary = dilate(binary, width, height, weight === 'thick' ? 2 : 1);
  }

  return cropToContent(binaryToCanvas(binary, width, height));
}

export async function imageToLineArt(
  src: string,
  weight: PictureLineWeight,
  options: ProcessOptions = {},
): Promise<string> {
  const maxSize = options.maxSize ?? MAX_SIZE;
  const format = options.format ?? 'auto';

  if (format !== 'raster') {
    const svg = await renderSvgOutline(src, weight, maxSize);
    if (svg) return svg;
  }
  return renderRasterLineArt(src, weight, maxSize);
}
