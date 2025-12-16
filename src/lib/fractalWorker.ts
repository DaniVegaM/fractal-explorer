// Web Worker para calcular fractales en un hilo separado

interface WorkerMessage {
  type: 'render';
  width: number;
  height: number;
  fractalType: string;
  iterations: number;
  zoom: number;
  centerX: number;
  centerY: number;
  palette: string;
  // Parámetros específicos de Julia
  cReal?: number;
  cImag?: number;
}

// Paletas de colores optimizadas (lookup tables)
const PALETTE_CACHE: Record<string, Uint8Array> = {};

function buildPalette(palette: string, maxIter: number): Uint8Array {
  const key = `${palette}-${maxIter}`;
  if (PALETTE_CACHE[key]) return PALETTE_CACHE[key];

  const colors = new Uint8Array(maxIter * 3 + 3); // +3 para el color del conjunto

  for (let i = 0; i < maxIter; i++) {
    const t = i / maxIter;
    let r = 0, g = 0, b = 0;

    switch (palette) {
      case 'fire':
        r = Math.min(255, t * 3 * 255);
        g = Math.max(0, Math.min(255, (t - 0.33) * 3 * 255));
        b = Math.max(0, Math.min(255, (t - 0.66) * 3 * 255));
        break;
      case 'ocean':
        r = Math.max(0, Math.min(255, (t - 0.66) * 3 * 255));
        g = Math.max(0, Math.min(255, (t - 0.33) * 3 * 255));
        b = Math.min(255, t * 1.5 * 255);
        break;
      case 'rainbow': {
        const hue = t * 360;
        const c = 1, x = 1 - Math.abs((hue / 60) % 2 - 1);
        if (hue < 60) { r = c * 255; g = x * 255; }
        else if (hue < 120) { r = x * 255; g = c * 255; }
        else if (hue < 180) { g = c * 255; b = x * 255; }
        else if (hue < 240) { g = x * 255; b = c * 255; }
        else if (hue < 300) { r = x * 255; b = c * 255; }
        else { r = c * 255; b = x * 255; }
        break;
      }
      case 'neon':
        r = Math.sin(t * Math.PI) * 255;
        g = Math.sin(t * Math.PI + 2) * 127 + 128;
        b = Math.cos(t * Math.PI) * 127 + 128;
        break;
      default: // grayscale
        r = g = b = t * 255;
    }

    colors[i * 3] = r;
    colors[i * 3 + 1] = g;
    colors[i * 3 + 2] = b;
  }

  // Color para puntos dentro del conjunto (negro)
  colors[maxIter * 3] = 0;
  colors[maxIter * 3 + 1] = 0;
  colors[maxIter * 3 + 2] = 0;

  PALETTE_CACHE[key] = colors;
  return colors;
}

function calculateMandelbrot(
  width: number,
  height: number,
  iterations: number,
  zoom: number,
  centerX: number,
  centerY: number,
  palette: string
): ImageData {
  const imgData = new ImageData(width, height);
  const data = imgData.data;
  const colors = buildPalette(palette, iterations);
  const scale = 1.0 / (width * 0.5 * zoom);
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  for (let y = 0; y < height; y++) {
    const cy = centerY + (y - halfHeight) * scale;
    const rowOffset = y * width;

    for (let x = 0; x < width; x++) {
      const cx = centerX + (x - halfWidth) * scale;
      let zx = 0, zy = 0, n = 0;

      // z² optimizado
      while (n < iterations) {
        const zx2 = zx * zx;
        const zy2 = zy * zy;
        if (zx2 + zy2 > 4) break;
        zy = 2 * zx * zy + cy;
        zx = zx2 - zy2 + cx;
        n++;
      }

      const i = (rowOffset + x) * 4;
      const colorIdx = n * 3;
      data[i] = colors[colorIdx];
      data[i + 1] = colors[colorIdx + 1];
      data[i + 2] = colors[colorIdx + 2];
      data[i + 3] = 255;
    }
  }

  return imgData;
}

function calculateJulia(
  width: number,
  height: number,
  iterations: number,
  zoom: number,
  centerX: number,
  centerY: number,
  cReal: number,
  cImag: number,
  palette: string
): ImageData {
  const imgData = new ImageData(width, height);
  const data = imgData.data;
  const colors = buildPalette(palette, iterations);
  const scale = 3.0 / (width * zoom); // Rango de -1.5 a 1.5
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * width;

    for (let x = 0; x < width; x++) {
      // En Julia, z comienza en el punto del pixel, c es constante
      let zx = centerX + (x - halfWidth) * scale;
      let zy = centerY + (y - halfHeight) * scale;
      let n = 0;

      while (n < iterations) {
        const zx2 = zx * zx;
        const zy2 = zy * zy;
        if (zx2 + zy2 > 4) break;
        zy = 2 * zx * zy + cImag;
        zx = zx2 - zy2 + cReal;
        n++;
      }

      const i = (rowOffset + x) * 4;
      const colorIdx = n * 3;
      data[i] = colors[colorIdx];
      data[i + 1] = colors[colorIdx + 1];
      data[i + 2] = colors[colorIdx + 2];
      data[i + 3] = 255;
    }
  }

  return imgData;
}

function calculateBurningShip(
  width: number,
  height: number,
  iterations: number,
  zoom: number,
  centerX: number,
  centerY: number,
  palette: string
): ImageData {
  const imgData = new ImageData(width, height);
  const data = imgData.data;
  const colors = buildPalette(palette, iterations);
  const scale = 1.0 / (width * 0.5 * zoom);
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  for (let y = 0; y < height; y++) {
    const cy = centerY + (y - halfHeight) * scale;
    const rowOffset = y * width;

    for (let x = 0; x < width; x++) {
      const cx = centerX + (x - halfWidth) * scale;
      let zx = 0, zy = 0, n = 0;

      // Burning Ship: z = (|Re(z)| + i|Im(z)|)² + c
      while (n < iterations) {
        const zx2 = zx * zx;
        const zy2 = zy * zy;
        if (zx2 + zy2 > 4) break;
        // Tomar valor absoluto antes de la operación
        const absZx = Math.abs(zx);
        const absZy = Math.abs(zy);
        zy = 2 * absZx * absZy + cy;
        zx = absZx * absZx - absZy * absZy + cx;
        n++;
      }

      const i = (rowOffset + x) * 4;
      const colorIdx = n * 3;
      data[i] = colors[colorIdx];
      data[i + 1] = colors[colorIdx + 1];
      data[i + 2] = colors[colorIdx + 2];
      data[i + 3] = 255;
    }
  }

  return imgData;
}

function calculateTricorn(
  width: number,
  height: number,
  iterations: number,
  zoom: number,
  centerX: number,
  centerY: number,
  palette: string
): ImageData {
  const imgData = new ImageData(width, height);
  const data = imgData.data;
  const colors = buildPalette(palette, iterations);
  const scale = 1.0 / (width * 0.5 * zoom);
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  for (let y = 0; y < height; y++) {
    const cy = centerY + (y - halfHeight) * scale;
    const rowOffset = y * width;

    for (let x = 0; x < width; x++) {
      const cx = centerX + (x - halfWidth) * scale;
      let zx = 0, zy = 0, n = 0;

      // Tricorn: z = conj(z)² + c = (zx - i*zy)² + c
      while (n < iterations) {
        const zx2 = zx * zx;
        const zy2 = zy * zy;
        if (zx2 + zy2 > 4) break;
        // El conjugado invierte el signo de la parte imaginaria
        // (zx - i*zy)² = zx² - zy² - 2i*zx*zy
        const newZx = zx2 - zy2 + cx;
        zy = -2 * zx * zy + cy;  // Nota: signo negativo (conjugado)
        zx = newZx;
        n++;
      }

      const i = (rowOffset + x) * 4;
      const colorIdx = n * 3;
      data[i] = colors[colorIdx];
      data[i + 1] = colors[colorIdx + 1];
      data[i + 2] = colors[colorIdx + 2];
      data[i + 3] = 255;
    }
  }

  return imgData;
}

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { type, width, height, fractalType, iterations, zoom, centerX, centerY, palette, cReal, cImag } = e.data;

  if (type !== 'render') return;

  let imageData: ImageData;

  switch (fractalType) {
    case 'mandelbrot':
      imageData = calculateMandelbrot(width, height, iterations, zoom, centerX, centerY, palette);
      break;
    case 'julia':
      imageData = calculateJulia(width, height, iterations, zoom, centerX, centerY, cReal ?? -0.7, cImag ?? 0.27, palette);
      break;
    case 'burning-ship':
      imageData = calculateBurningShip(width, height, iterations, zoom, centerX, centerY, palette);
      break;
    case 'tricorn':
      imageData = calculateTricorn(width, height, iterations, zoom, centerX, centerY, palette);
      break;
    default:
      return;
  }

  (self as unknown as Worker).postMessage(
    { type: 'result', data: imageData.data, width, height },
    [imageData.data.buffer]
  );
};
