
import type { FractalType, PaletteType } from './fractalConfig';
import { getColor } from './colorUtils';

interface RenderOptions {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  fractalType: FractalType;
  params: Record<string, number>;
  center: { x: number; y: number };
  palette: PaletteType;
}

/**
 * Dibuja el conjunto de Mandelbrot generalizado: z → z^power + c
 */
function _drawMandelbrot(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  iterations: number,
  zoom: number,
  centerX: number,
  centerY: number,
  palette: PaletteType,
  power: number // Exponente de la fórmula
) {
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;
  const scale = 1.0 / (width * 0.5 * zoom);

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const cx = centerX + (x - width / 2) * scale;
      const cy = centerY + (y - height / 2) * scale;

      let zx = 0, zy = 0, n = 0;

      while (n < iterations) {
        const r2 = zx * zx + zy * zy;
        if (r2 > 4) break; // Límite de escape

        // z^power usando coordenadas polares: z = r*e^(i*theta)
        // z^n = r^n * e^(i*n*theta)
        const r = Math.sqrt(r2);
        const theta = Math.atan2(zy, zx);
        const rn = Math.pow(r, power);
        const newTheta = theta * power;

        zx = rn * Math.cos(newTheta) + cx;
        zy = rn * Math.sin(newTheta) + cy;
        n++;
      }
      
      const i = (y * width + x) * 4;
      const [r, g, b] = getColor(n, iterations, palette);
      
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

// (Aquí podrías añadir _drawJulia, _drawBurningShip, etc.)

/**
 * Función principal que selecciona qué fractal renderizar
 */
export function renderFractal({
  ctx, width, height, fractalType, params, center, palette
}: RenderOptions) {
  
  console.time("drawFractal"); // Mide el tiempo de dibujado

  switch (fractalType) {
    case 'mandelbrot':
      const { iterations, zoom, power } = params;
      if (iterations === undefined || zoom === undefined || power === undefined) return;
      
      _drawMandelbrot(
        ctx, width, height,
        iterations, zoom,
        center.x, center.y,
        palette, power
      );
      break;

    // case 'julia':
    //   // Lógica para Julia aquí
    //   break;
    
    default:
      // Fractal no implementado
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, width, height);
      console.warn(`Renderizador para ${fractalType} no implementado.`);
  }

  console.timeEnd("drawFractal"); // Muestra el tiempo en consola
}