// Web Worker para calcular fractales en un hilo separado

interface WorkerMessage {
  type: 'render';
  width: number;
  height: number;
  fractalType: string;
  iterations: number;
  zoom: number;
  power: number;
  centerX: number;
  centerY: number;
  palette: string;
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
  power: number,
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

  // Optimización: precalcular si es potencia entera
  const isIntegerPower = Math.abs(power - Math.round(power)) < 0.01;
  const intPower = Math.round(power);

  for (let y = 0; y < height; y++) {
    const cy = centerY + (y - halfHeight) * scale;
    const rowOffset = y * width;

    for (let x = 0; x < width; x++) {
      const cx = centerX + (x - halfWidth) * scale;
      let zx = 0, zy = 0, n = 0;

      if (isIntegerPower && intPower === 2) {
        // Optimización especial para z² (el caso más común)
        while (n < iterations) {
          const zx2 = zx * zx;
          const zy2 = zy * zy;
          if (zx2 + zy2 > 4) break;
          zy = 2 * zx * zy + cy;
          zx = zx2 - zy2 + cx;
          n++;
        }
      } else if (isIntegerPower && intPower === 3) {
        // Optimización para z³
        while (n < iterations) {
          const zx2 = zx * zx;
          const zy2 = zy * zy;
          if (zx2 + zy2 > 4) break;
          const newZx = zx * (zx2 - 3 * zy2) + cx;
          zy = zy * (3 * zx2 - zy2) + cy;
          zx = newZx;
          n++;
        }
      } else {
        // Caso general con coordenadas polares
        while (n < iterations) {
          const r2 = zx * zx + zy * zy;
          if (r2 > 4) break;
          const r = Math.sqrt(r2);
          const theta = Math.atan2(zy, zx);
          const rn = Math.pow(r, power);
          const newTheta = theta * power;
          zx = rn * Math.cos(newTheta) + cx;
          zy = rn * Math.sin(newTheta) + cy;
          n++;
        }
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
  const { type, width, height, fractalType, iterations, zoom, power, centerX, centerY, palette } = e.data;

  if (type === 'render' && fractalType === 'mandelbrot') {
    const imageData = calculateMandelbrot(width, height, iterations, zoom, power, centerX, centerY, palette);
    // Enviar los datos como Uint8ClampedArray transferible
    (self as unknown as Worker).postMessage(
      { type: 'result', data: imageData.data, width, height },
      [imageData.data.buffer]
    );
  }
};
