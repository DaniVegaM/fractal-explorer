
export type FractalType = "mandelbrot" | "julia" | "burning-ship" | "newton";

export type PaletteType = 
  | 'grayscale' | 'fire' | 'ocean' | 'cosmic' 
  | 'rainbow' | 'neon' | 'earth' | 'gradient';

export interface FractalParam {
  label: string;
  key: string;
  min: number;
  max: number;
  step: number;
  default: number;
  description: string;
}

export interface FractalConfig {
  name: string;
  description: string;
  params: FractalParam[];
  defaultCenter: { x: number; y: number };
}

export const fractals: Record<FractalType, FractalConfig> = {
  mandelbrot: {
    name: "Conjunto de Mandelbrot",
    description: "El icónico fractal z → z² + c. Los puntos que no escapan al infinito pertenecen al conjunto.",
    defaultCenter: { x: -0.5, y: 0 },
    params: [
      { label: "Iteraciones", key: "iterations", min: 20, max: 300, step: 10, default: 100,
        description: "Más iteraciones = más detalle. Afecta mucho al rendimiento." },
      { label: "Zoom", key: "zoom", min: 1, max: 100000, step: 1, default: 1,
        description: "Nivel de acercamiento. El zoom con rueda es más rápido." },
      { label: "Suavizado", key: "smoothing", min: 0, max: 1, step: 0.1, default: 1,
        description: "Elimina las 'bandas' de color para transiciones suaves." },
    ],
  },
  julia: {
    name: "Conjunto de Julia",
    description: "Similar al Mandelbrot, pero 'c' es constante y el punto inicial 'z' varía.",
    defaultCenter: { x: 0, y: 0 },
    params: [
      { label: "Iteraciones", key: "iterations", min: 20, max: 300, step: 10, default: 150,
        description: "Más iteraciones = más detalle." },
      { label: "C Real", key: "cReal", min: -2, max: 2, step: 0.01, default: -0.7,
        description: "La parte 'real' de la constante 'c'. ¡Experimenta!" },
      { label: "C Imaginario", key: "cImag", min: -2, max: 2, step: 0.01, default: 0.27,
        description: "La parte 'imaginaria' de la constante 'c'." },
      { label: "Zoom", key: "zoom", min: 1, max: 1000, step: 1, default: 1,
        description: "Nivel de acercamiento." },
    ],
  },
  "burning-ship": {
    name: "Burning Ship",
    description: "Variación que usa el valor absoluto: z → (|Re(z)| + i|Im(z)|)² + c.",
    defaultCenter: { x: -0.5, y: -0.5 },
    params: [
      { label: "Iteraciones", key: "iterations", min: 20, max: 300, step: 10, default: 100,
        description: "Más iteraciones = más detalle." },
      { label: "Zoom", key: "zoom", min: 1, max: 1000, step: 1, default: 1,
        description: "Nivel de acercamiento." },
    ],
  },
  newton: {
    name: "Fractal de Newton",
    description: "Muestra a qué raíz de un polinomio converge cada punto.",
    defaultCenter: { x: 0, y: 0 },
    params: [
      { label: "Iteraciones", key: "iterations", min: 10, max: 100, step: 5, default: 30,
        description: "Define la precisión de la convergencia." },
      { label: "Raíces", key: "roots", min: 3, max: 8, step: 1, default: 3,
        description: "El número de raíces del polinomio (ej. z³ - 1)." },
    ],
  },
};