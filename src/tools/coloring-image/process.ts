export type PictureLineWeight = 'thin' | 'medium' | 'thick';

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

function thresholdFor(weight: PictureLineWeight): number {
  if (weight === 'thin') return 120;
  if (weight === 'thick') return 200;
  return 160;
}

function dilate(binary: Uint8Array, width: number, height: number, radius: number): Uint8Array {
  if (radius <= 0) return binary;
  const source = binary;
  const output = new Uint8Array(binary);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (source[y * width + x] === 0) continue;
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

export async function imageToLineArt(src: string, weight: PictureLineWeight): Promise<string> {
  const image = await loadImage(src);
  const scale = MAX_SIZE / Math.max(image.naturalWidth, image.naturalHeight);
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D context unavailable');

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  const drawScale = Math.min(
    (width - PADDING * 2) / image.naturalWidth,
    (height - PADDING * 2) / image.naturalHeight,
  );
  const drawWidth = image.naturalWidth * drawScale;
  const drawHeight = image.naturalHeight * drawScale;
  context.drawImage(
    image,
    (width - drawWidth) / 2,
    (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );

  const imageData = context.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const binary = new Uint8Array(width * height);
  const threshold = thresholdFor(weight);
  for (let index = 0; index < width * height; index += 1) {
    const offset = index * 4;
    const luminance =
      pixels[offset] * 0.299 + pixels[offset + 1] * 0.587 + pixels[offset + 2] * 0.114;
    binary[index] = luminance < threshold ? 1 : 0;
  }

  const radius = weight === 'thin' ? 0 : weight === 'thick' ? 2 : 1;
  const dilated = dilate(binary, width, height, radius);
  for (let index = 0; index < width * height; index += 1) {
    const offset = index * 4;
    const value = dilated[index] ? 0 : 255;
    pixels[offset] = value;
    pixels[offset + 1] = value;
    pixels[offset + 2] = value;
    pixels[offset + 3] = 255;
  }
  context.putImageData(imageData, 0, 0);

  // Trim the surrounding white margin so the drawing fills the printable area.
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!dilated[y * width + x]) continue;
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

  const output = document.createElement('canvas');
  output.width = cropWidth;
  output.height = cropHeight;
  const outputContext = output.getContext('2d');
  if (!outputContext) throw new Error('Canvas 2D context unavailable');
  outputContext.fillStyle = '#ffffff';
  outputContext.fillRect(0, 0, cropWidth, cropHeight);
  outputContext.drawImage(canvas, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
  return output.toDataURL('image/png');
}
