// components/FractalControlsSidebar.tsx
import {
  Settings,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import type { FractalType, FractalConfig, PaletteType, FractalParam } from "../lib/fractalConfig";

// Define las paletas de colores
const PALETTES: { id: PaletteType; style: React.CSSProperties }[] = [
  { id: 'grayscale', style: { background: 'linear-gradient(135deg, #fff 0%, #000 100%)' } },
  { id: 'fire', style: { background: 'linear-gradient(135deg, #fff 20%, #ff0 50%, #f00 100%)' } },
  { id: 'ocean', style: { background: 'linear-gradient(135deg, #fff 20%, #0ff 60%, #00f 100%)' } },
  { id: 'rainbow', style: { background: 'linear-gradient(135deg, #f00 0%, #ff0 33%, #0f0 66%, #00f 100%)' } },
  { id: 'neon', style: { background: 'linear-gradient(135deg, #0ff 0%, #f0f 100%)' } },
];

// Define las props que espera el componente
interface FractalControlsSidebarProps {
  fractals: Record<FractalType, FractalConfig>;
  selectedFractal: FractalType;
  params: Record<string, number>;
  selectedPalette: PaletteType;
  onFractalChange: (type: FractalType) => void;
  onParamChange: (key: string, value: number) => void;
  onParamChangeEnd: () => void;
  onPaletteChange: (palette: PaletteType) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
}

export default function FractalControlsSidebar({
  fractals,
  selectedFractal,
  params,
  selectedPalette,
  onFractalChange,
  onParamChange,
  onParamChangeEnd,
  onPaletteChange,
  onZoomIn,
  onZoomOut,
  onResetView,
}: FractalControlsSidebarProps) {
  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Selector de Fractal */}
      <div>
        <h3 className="text-sm font-semibold text-lime-400 mb-3 flex items-center gap-2">
          <Settings size={16} />
          TIPO DE FRACTAL
        </h3>
        <div className="space-y-2">
          {(Object.keys(fractals) as FractalType[]).map((type) => (
            <button
              key={type}
              onClick={() => onFractalChange(type)}
              className={`cursor-pointer w-full text-left px-4 py-3 rounded-lg transition-all ${
                selectedFractal === type
                  ? "bg-lime-500 text-gray-950 shadow-lg font-semibold"
                  : "bg-neutral-800 text-gray-300 hover:bg-neutral-700"
              }`}
            >
              <div className="font-medium">{fractals[type].name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Parámetros */}
      <div>
        <h3 className="text-sm font-semibold text-purple-400 mb-3">
          PARÁMETROS
        </h3>
        <div className="space-y-4">
          {fractals[selectedFractal].params.map((param: FractalParam) => (
            <div key={param.key}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-gray-300">{param.label}</label>
                <span className="text-sm font-mono text-lime-400">
                  {params[param.key]?.toFixed(param.step < 1 ? 2 : 0) ||
                    param.default}
                </span>
              </div>
              <input
                type="range"
                min={param.min}
                max={param.max}
                step={param.step}
                value={params[param.key] ?? param.default}
                onChange={(e) =>
                  onParamChange(param.key, parseFloat(e.target.value))
                }
                onMouseUp={onParamChangeEnd}
                onTouchEnd={onParamChangeEnd}
                className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-lime-400"
              />
              <p className="text-xs text-gray-500 mt-1 px-1">{param.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Paleta de Colores */}
      <div>
        <h3 className="text-sm font-semibold text-purple-400 mb-3">
          PALETA DE COLORES
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {PALETTES.map(palette => (
            <button
              key={palette.id}
              onClick={() => onPaletteChange(palette.id)}
              className={`cursor-pointer h-12 rounded-lg border-2 transition-all ${
                selectedPalette === palette.id
                  ? 'border-lime-400 scale-105'
                  : 'border-gray-600 hover:border-gray-400'
              }`}
              style={palette.style}
              title={palette.id}
            />
          ))}
        </div>
      </div>

      {/* Controles de Navegación */}
      <div>
        <h3 className="text-sm font-semibold text-purple-400 mb-3">
          NAVEGACIÓN
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={onZoomIn}
            className="cursor-pointer px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <ZoomIn size={18} />
            Acercar
          </button>
          <button
            onClick={onZoomOut}
            className="cursor-pointer px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <ZoomOut size={18} />
            Alejar
          </button>
          <button
            onClick={onResetView}
            className="cursor-pointer col-span-2 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw size={18} />
            Reiniciar Vista
          </button>
        </div>
      </div>
    </div>
  );
}