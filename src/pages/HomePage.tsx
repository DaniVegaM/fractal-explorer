// pages/HomePage.tsx
import { useEffect, useRef, useState, MouseEvent, WheelEvent } from "react";
import { Download, Info, ChevronRight } from "lucide-react";

// Importa el componente de UI
import FractalControlsSidebar from "../components/FractalControlsSidebar";

// Importa los tipos y la configuración
import {
    fractals,
    type FractalType,
    type PaletteType,
} from "../lib/fractalConfig";

// Importa el motor de renderizado
import { renderFractal } from "../lib/fractalRenderer";

export default function HomePage() {
    // --- Estado ---
    const [selectedFractal, setSelectedFractal] = useState<FractalType>("mandelbrot");
    const [showInfo, setShowInfo] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isAnimating, setIsAnimating] = useState(false);
    const [selectedPalette, setSelectedPalette] = useState<PaletteType>('grayscale');
    const [params, setParams] = useState<Record<string, number>>(
        Object.fromEntries(
            fractals[selectedFractal].params.map((p) => [p.key, p.default])
        )
    );
    const [center, setCenter] = useState(fractals[selectedFractal].defaultCenter);

    // --- Refs ---
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDragging = useRef(false);
    const lastMousePos = useRef({ x: 0, y: 0 });

    // --- Lógica de Renderizado (useEffect) ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Ajusta el tamaño del canvas a su contenedor
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        // Delega todo el trabajo de dibujado al renderizador
        renderFractal({
            ctx,
            width: canvas.width,
            height: canvas.height,
            fractalType: selectedFractal,
            params,
            center,
            palette: selectedPalette,
        });

        // Se redibuja si cambian los params, el fractal, el centro o la paleta
    }, [params, selectedFractal, center, selectedPalette]);


    // --- Manejadores de Lógica (Estado) ---

    const handleFractalChange = (type: FractalType) => {
        setSelectedFractal(type);
        setParams(
            Object.fromEntries(fractals[type].params.map((p) => [p.key, p.default]))
        );
        setCenter(fractals[type].defaultCenter);
    };

    const handleParamChange = (key: string, value: number) => {
        setParams((prev) => ({ ...prev, [key]: value }));
    };

    const toggleAnimation = () => {
        setIsAnimating((prev) => !prev);
    };

    const handlePaletteChange = (palette: PaletteType) => {
        setSelectedPalette(palette);
    };

    const handleZoom = (factor: number) => {
        const currentZoom = params.zoom || 1;
        let newZoom = currentZoom * factor;

        const zoomParamConfig = fractals[selectedFractal].params.find(p => p.key === 'zoom');
        const minZoom = zoomParamConfig?.min ?? 1;
        const maxZoom = zoomParamConfig?.max ?? 100000;

        newZoom = Math.max(minZoom, Math.min(newZoom, maxZoom));
        handleParamChange('zoom', newZoom);
    };

    const handleResetView = () => {
        setCenter(fractals[selectedFractal].defaultCenter);
        setParams(
            Object.fromEntries(fractals[selectedFractal].params.map((p) => [p.key, p.default]))
        );
    };


    // --- Manejadores de Interacción (Mouse) ---

    const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
        isDragging.current = true;
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
        if (!isDragging.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;

        const scale = 1.0 / (canvas.width * 0.5 * (params.zoom || 1));

        setCenter(prev => ({
            x: prev.x - dx * scale,
            y: prev.y - dy * scale,
        }));

        lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleWheel = (e: WheelEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.5 : 1 / 1.5; // Zoom In o Out
        handleZoom(factor);
    };


    // --- Renderizado (JSX) ---

    return (
        <div className="h-screen w-screen bg-neutral-950 flex flex-col overflow-hidden">
            <header className="bg-neutral-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div>
                            <h1 className="text-xl font-bold text-white uppercase">
                                Fractal Explorer
                            </h1>
                            <p className="text-xs text-gray-400">
                                Donde las matemáticas se vuelven arte
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowInfo(!showInfo)}
                        className="cursor-pointer p-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-lime-400 transition-colors"
                        title="Información"
                    >
                        <Info size={20} />
                    </button>
                    <button
                        className="cursor-pointer p-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-lime-400 transition-colors"
                        title="Descargar imagen"
                    >
                        <Download size={20} />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <aside
                    className={`bg-neutral-900 border-r border-gray-800 transition-all duration-300 ${showControls ? "w-80" : "w-0"
                        } overflow-hidden`}
                >
                    <FractalControlsSidebar
                        fractals={fractals}
                        selectedFractal={selectedFractal}
                        params={params}
                        isAnimating={isAnimating}
                        selectedPalette={selectedPalette}
                        onFractalChange={handleFractalChange}
                        onParamChange={handleParamChange}
                        onAnimateToggle={toggleAnimation}
                        onPaletteChange={handlePaletteChange}
                        onZoomIn={() => handleZoom(1.5)}
                        onZoomOut={() => handleZoom(1 / 1.5)}
                        onResetView={handleResetView}
                    />
                </aside>

                {/* Toggle Button */}
                <button
                    onClick={() => setShowControls(!showControls)}
                    className="cursor-pointer absolute left-0 top-1/2 transform -translate-y-1/2 bg-neutral-800 hover:bg-neutral-700 text-lime-400 p-2 rounded-r-lg border-r border-t border-b border-gray-700 transition-all z-10"
                    style={{ left: showControls ? "320px" : "0" }}
                >
                    <ChevronRight
                        size={20}
                        className={`transition-transform ${showControls ? "rotate-180" : ""}`}
                    />
                </button>


                {/* --- CANVAS AREA --- */}
                <main className="flex-1 relative bg-black">
                    {/* Info Overlay */}
                    {showInfo && (
                        <div className="absolute top-4 left-4 right-4 bg-neutral-800/95 backdrop-blur-sm border border-gray-700 rounded-lg p-6 z-10 max-w-2xl">
                            <div className="flex items-start justify-between mb-4">
                                <h2 className="text-xl font-bold text-lime-400">
                                    {fractals[selectedFractal].name}
                                </h2>
                                <button
                                    onClick={() => setShowInfo(false)}
                                    className="cursor-pointer text-gray-400 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>
                            <p className="text-gray-300 leading-relaxed">
                                {fractals[selectedFractal].description}
                            </p>
                            <div className="mt-4 pt-4 border-t border-gray-700">
                                <h3 className="text-sm font-semibold text-purple-400 mb-2">
                                    CONTROLES
                                </h3>
                                <ul className="text-sm text-gray-400 space-y-1">
                                    <li>• <span className="text-lime-400">Click & Drag</span>: Mover la vista</li>
                                    <li>• <span className="text-lime-400">Rueda del ratón</span>: Zoom in/out</li>
                                    <li>• <span className="text-lime-400">Doble click</span>: Centrar y acercar</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Canvas Real */}
                    <canvas
                        ref={canvasRef}
                        className="w-full h-full cursor-grab"
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onMouseMove={handleMouseMove}
                        onWheel={handleWheel}
                    />

                    {/* Stats Overlay */}
                    <div className="absolute bottom-4 left-4 bg-neutral-800/90 backdrop-blur-sm border border-gray-700 rounded-lg px-4 py-2 text-sm">
                        <div className="flex items-center gap-4 text-gray-300">
                            {/* <span>FPS: <span className="text-lime-400 font-mono">--</span></span> */}
                            <span>Zoom: <span className="text-lime-400 font-mono">{params.zoom?.toFixed(0) || 1}x</span></span>
                            <span>Iteraciones: <span className="text-lime-400 font-mono">{params.iterations || 0}</span></span>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}