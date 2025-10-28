// lib/colorUtils.ts
import type { PaletteType } from './fractalConfig';

// Helper para interpolar linealmente entre dos valores
export function lerp(a: number, b: number, t: number): number {
  return a * (1 - t) + b * t;
}

// Helper para convertir HSL a [R, G, B] (valores 0-255)
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Obtiene el color [R, G, B] para un valor de iteración 'n'.
 * @param n - El valor de iteración (puede ser decimal para 'smooth coloring').
 * @param maxIterations - El máximo de iteraciones.
 * @param palette - El nombre de la paleta seleccionada.
 */
export function getColor(n: number, maxIterations: number, palette: PaletteType): [number, number, number] {
  if (n === maxIterations) {
    return [0, 0, 0]; // Interior del conjunto
  }

  // Normaliza 'n' a un valor entre 0 y 1
  const t = n / maxIterations;

  switch (palette) {
    case 'grayscale':
      const color = Math.floor(255 * t);
      return [color, color, color];
    
    case 'fire':
      const r_fire = Math.floor(255 * t);
      const g_fire = Math.floor(255 * Math.max(0, t * 2 - 1));
      const b_fire = Math.floor(255 * Math.max(0, t * 4 - 3));
      return [r_fire, g_fire, b_fire];

    case 'ocean':
      const r_ocean = Math.floor(255 * Math.max(0, t * 4 - 3));
      const g_ocean = Math.floor(255 * Math.max(0, t * 2 - 1));
      const b_ocean = Math.floor(255 * t);
      return [r_ocean, g_ocean, b_ocean];

    case 'rainbow':
      const [r_rain, g_rain, b_rain] = hslToRgb(t, 1, 0.5);
      return [r_rain, g_rain, b_rain];
      
    case 'neon':
      const [r_neon, g_neon, b_neon] = hslToRgb(t * 1.2, 1, 0.6); // 1.2 para ciclar más rápido
      return [r_neon, g_neon, b_neon];

    // ... (añade más paletas aquí)
    
    default:
      const defaultColor = Math.floor(255 * t);
      return [defaultColor, defaultColor, defaultColor];
  }
}