
import type { FractalType, PaletteType } from './fractalConfig';
import { getColor, lerp } from './colorUtils';

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
 * Dibuja el conjunto de Mandelbrot en el canvas
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
  smoothing: number // 0 a 1
) {
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;
  const scale = 1.0 / (width * 0.5 * zoom);
  const log2 = Math.log(2);

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const cx = centerX + (x - width / 2) * scale;
      const cy = centerY + (y - height / 2) * scale;

      let zx = 0, zy = 0, n = 0, zx2 = 0, zy2 = 0;

      while (n < iterations) {
        zx2 = zx * zx;
        zy2 = zy * zy;
        
        if (zx2 + zy2 > 4) break; // Límite de escape

        const tempZx = zx2 - zy2 + cx;
        zy = 2 * zx * zy + cy;
        zx = tempZx;
        n++;
      }
      
      const i = (y * width + x) * 4;
      let final_n = n;

      if (n < iterations && smoothing > 0) {
        const log_zn = Math.log(zx2 + zy2) / 2;
        const nu = Math.log(log_zn / log2) / log2;
        const n_smooth = n + 1 - nu;
        final_n = lerp(n, n_smooth, smoothing);
      }

      const [r, g, b] = getColor(final_n, iterations, palette);
      
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
      const { iterations, zoom, smoothing } = params;
      if (iterations === undefined || zoom === undefined || smoothing === undefined) return;
      
      _drawMandelbrot(
        ctx, width, height,
        iterations, zoom,
        center.x, center.y,
        palette, smoothing
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