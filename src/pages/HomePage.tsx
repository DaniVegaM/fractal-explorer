// pages/HomePage.tsx
import { useEffect, useRef, useState, type MouseEvent, type WheelEvent } from "react";
import { Download, Info, ChevronRight } from "lucide-react";

// Importa el componente de UI
import FractalControlsSidebar from "../components/FractalControlsSidebar";

// Importa los tipos y la configuración
import {
    fractals,
    type FractalType,
    type PaletteType,
} from "../lib/fractalConfig";

// Importa el motor de renderizado (fallback para otros fractales)
import { renderFractal } from "../lib/fractalRenderer";

// Web Worker para cálculos en paralelo
import FractalWorker from "../lib/fractalWorker?worker";

export default function HomePage() {
    // --- Estado ---
    const [selectedFractal, setSelectedFractal] = useState<FractalType>("mandelbrot");
    const [showInfo, setShowInfo] = useState(false);
    const [showControls, setShowControls] = useState(true);
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
    const workerRef = useRef<Worker | null>(null);
    const hiResTimeoutRef = useRef<number | null>(null);

    // --- Inicializar Web Worker ---
    useEffect(() => {
        workerRef.current = new FractalWorker();
        return () => {
            workerRef.current?.terminate();
        };
    }, []);

    // Canvas offscreen para evitar parpadeos
    const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

    // --- Función de renderizado con Worker ---
    const renderToCanvas = (
        renderParams: Record<string, number>,
        renderCenter: { x: number; y: number },
        lowRes: boolean = false
    ) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        if (!workerRef.current) {
            renderFractal({
                ctx, 
                width: canvas.width, 
                height: canvas.height,
                fractalType: selectedFractal,
                params: renderParams, 
                center: renderCenter,
                palette: selectedPalette,
            });
            return;
        }

        const scale = lowRes ? 0.35 : 1;
        const renderWidth = Math.floor(canvas.width * scale);
        const renderHeight = Math.floor(canvas.height * scale);
        const iterations = lowRes ? Math.min(renderParams.iterations || 100, 50) : (renderParams.iterations || 100);

        workerRef.current.onmessage = (e) => {
            if (e.data.type === 'result') {
                const { data, width: w, height: h } = e.data;
                const imageData = new ImageData(new Uint8ClampedArray(data), w, h);
                
                if (lowRes) {
                    // Para baja res: usar canvas offscreen y escalar directamente
                    if (!offscreenCanvasRef.current) {
                        offscreenCanvasRef.current = document.createElement('canvas');
                    }
                    const offscreen = offscreenCanvasRef.current;
                    offscreen.width = w;
                    offscreen.height = h;
                    const offCtx = offscreen.getContext('2d')!;
                    offCtx.putImageData(imageData, 0, 0);
                    
                    // Dibujar escalado al canvas principal
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'medium';
                    ctx.drawImage(offscreen, 0, 0, canvas.width, canvas.height);
                } else {
                    ctx.putImageData(imageData, 0, 0);
                }
            }
        };

        workerRef.current.postMessage({
            type: 'render',
            width: renderWidth,
            height: renderHeight,
            fractalType: selectedFractal,
            iterations,
            zoom: renderParams.zoom || 1,
            centerX: renderCenter.x,
            centerY: renderCenter.y,
            palette: selectedPalette,
            // Parámetros específicos de Julia
            cReal: renderParams.cReal,
            cImag: renderParams.cImag,
        });
    };

    // --- Programar renderizado de alta resolución (con debounce) ---
    const scheduleHiResRender = (renderParams: Record<string, number>, renderCenter: { x: number; y: number }) => {
        if (hiResTimeoutRef.current) {
            clearTimeout(hiResTimeoutRef.current);
        }
        
        hiResTimeoutRef.current = window.setTimeout(() => {
            renderToCanvas(renderParams, renderCenter, false);
        }, 250);
    };

    // --- Renderizado inicial y cuando cambian parámetros (sin parpadeo) ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        // Renderizar alta calidad directamente
        renderToCanvas(params, center, false);

        return () => {
            if (hiResTimeoutRef.current) {
                clearTimeout(hiResTimeoutRef.current);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedFractal, selectedPalette]);


    // --- Manejadores de Lógica (Estado) ---

    const handleFractalChange = (type: FractalType) => {
        setSelectedFractal(type);
        setParams(
            Object.fromEntries(fractals[type].params.map((p) => [p.key, p.default]))
        );
        setCenter(fractals[type].defaultCenter);
    };

    const handleParamChange = (key: string, value: number) => {
        const newParams = { ...params, [key]: value };
        setParams(newParams);
        // Solo baja res mientras arrastra el slider, alta res cuando suelta
        renderToCanvas(newParams, center, true);
    };

    const handleParamChangeEnd = () => {
        // Cancelar cualquier render pendiente y hacer alta res
        if (hiResTimeoutRef.current) {
            clearTimeout(hiResTimeoutRef.current);
        }
        renderToCanvas(params, center, false);
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
        const newParams = { ...params, zoom: newZoom };
        setParams(newParams);
        // Solo baja res durante scroll, programar alta res después
        renderToCanvas(newParams, center, true);
        scheduleHiResRender(newParams, center);
    };

    const handleResetView = () => {
        const newCenter = fractals[selectedFractal].defaultCenter;
        const newParams = Object.fromEntries(fractals[selectedFractal].params.map((p) => [p.key, p.default]));
        setCenter(newCenter);
        setParams(newParams);
        // Render directo en alta calidad
        renderToCanvas(newParams, newCenter, false);
    };

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Crear un link temporal para descargar
        const link = document.createElement('a');
        const zoom = params.zoom || 1;
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
        link.download = `${selectedFractal}_z${zoom.toFixed(0)}_${selectedPalette}_${timestamp}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    // --- Manejadores de Interacción (Mouse) ---

    const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
        isDragging.current = true;
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
        if (isDragging.current) {
            isDragging.current = false;
            // Cancelar renders pendientes y hacer alta res
            if (hiResTimeoutRef.current) {
                clearTimeout(hiResTimeoutRef.current);
            }
            renderToCanvas(params, center, false);
        }
    };

    const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
        if (!isDragging.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;

        // Julia usa escala diferente (3.0 vs 2.0 para otros)
        const baseScale = selectedFractal === 'julia' ? 3.0 : 2.0;
        const scale = baseScale / (canvas.width * (params.zoom || 1));

        const newCenter = {
            x: center.x - dx * scale,
            y: center.y - dy * scale,
        };
        setCenter(newCenter);
        lastMousePos.current = { x: e.clientX, y: e.clientY };
        
        // Renderizar baja res mientras arrastra
        renderToCanvas(params, newCenter, true);
    };

    const handleWheel = (e: WheelEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.5 : 1 / 1.5;
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
                        onClick={handleDownload}
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
                        selectedPalette={selectedPalette}
                        onFractalChange={handleFractalChange}
                        onParamChange={handleParamChange}
                        onParamChangeEnd={handleParamChangeEnd}
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
                            <span>Zoom: <span className="text-lime-400 font-mono">{params.zoom?.toFixed(0) || 1}x</span></span>
                            <span>Iteraciones: <span className="text-lime-400 font-mono">{params.iterations || 0}</span></span>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}