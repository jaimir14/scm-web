import React, { useState, useRef, useCallback, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Sun,
  Contrast,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Download,
  Move,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MedicalImage {
  id: number;
  viewUrl?: string;
  fileName: string;
}

interface MedicalImageViewerProps {
  images: MedicalImage[];
  initialIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MedicalImageViewer({
  images,
  initialIndex,
  open,
  onOpenChange,
}: MedicalImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showControls, setShowControls] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentImage = images[currentIndex];

  // Reset state when image changes or dialog opens
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (open) {
      resetView();
    }
  }, [open]);

  const resetView = () => {
    setZoom(1);
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 5));
  const handleZoomOut = () => {
    setZoom((z) => {
      const newZoom = Math.max(z - 0.25, 0.25);
      if (newZoom <= 1) setPosition({ x: 0, y: 0 });
      return newZoom;
    });
  };
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) handleZoomIn();
      else handleZoomOut();
    },
    []
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handlePointerUp = () => setIsDragging(false);

  const goNext = () => {
    resetView();
    setCurrentIndex((i) => (i + 1) % images.length);
  };
  const goPrev = () => {
    resetView();
    setCurrentIndex((i) => (i - 1 + images.length) % images.length);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
          goNext();
          break;
        case "ArrowLeft":
          goPrev();
          break;
        case "Escape":
          onOpenChange(false);
          break;
        case "+":
        case "=":
          handleZoomIn();
          break;
        case "-":
          handleZoomOut();
          break;
        case "r":
          handleRotate();
          break;
        case "0":
          resetView();
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, currentIndex]);

  const handleDownload = () => {
    if (!currentImage?.viewUrl) return;
    const a = document.createElement("a");
    a.href = currentImage.viewUrl;
    a.download = currentImage.fileName;
    a.target = "_blank";
    a.click();
  };

  if (!currentImage) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[100vw] max-h-[100vh] w-screen h-screen p-0 border-none bg-black/95 gap-0 rounded-none sm:rounded-none [&>button]:hidden"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div
          className={cn(
            "absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/70 to-transparent transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-white/90 truncate max-w-[200px] sm:max-w-[400px]">
              {currentImage.fileName}
            </span>
            {images.length > 1 && (
              <span className="text-xs text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
                {currentIndex + 1} / {images.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <ToolbarButton icon={Download} label="Descargar" onClick={handleDownload} />
            <ToolbarButton icon={X} label="Cerrar (Esc)" onClick={() => onOpenChange(false)} />
          </div>
        </div>

        {/* Image area */}
        <div
          ref={containerRef}
          className={cn(
            "relative flex items-center justify-center w-full h-full overflow-hidden select-none",
            zoom > 1 ? "cursor-grab" : "cursor-default",
            isDragging && "cursor-grabbing"
          )}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onClick={() => setShowControls((s) => !s)}
        >
          <img
            src={currentImage.viewUrl}
            alt={currentImage.fileName}
            draggable={false}
            className="max-h-[85vh] max-w-[90vw] object-contain transition-transform duration-150 ease-out"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
              filter: `brightness(${brightness}%) contrast(${contrast}%)`,
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Navigation arrows */}
        {images.length > 1 && showControls && (
          <>
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white/80 hover:text-white rounded-full p-2 transition-all backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white/80 hover:text-white rounded-full p-2 transition-all backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Bottom toolbar */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 z-20 transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <div className="mx-auto max-w-xl px-4 pb-4">
            <div className="bg-black/60 backdrop-blur-md rounded-xl border border-white/10 p-3 space-y-3">
              {/* Zoom & rotation controls */}
              <div className="flex items-center justify-center gap-1 flex-wrap">
                <ToolbarButton icon={ZoomOut} label="Alejar (-)" onClick={handleZoomOut} />
                <span className="text-xs text-white/70 min-w-[3rem] text-center font-mono">
                  {Math.round(zoom * 100)}%
                </span>
                <ToolbarButton icon={ZoomIn} label="Acercar (+)" onClick={handleZoomIn} />
                <div className="w-px h-5 bg-white/20 mx-1" />
                <ToolbarButton icon={RotateCw} label="Rotar (R)" onClick={handleRotate} />
                <ToolbarButton icon={Maximize2} label="Reiniciar (0)" onClick={resetView} />
                {zoom > 1 && (
                  <>
                    <div className="w-px h-5 bg-white/20 mx-1" />
                    <span className="text-[10px] text-white/40 flex items-center gap-1">
                      <Move className="h-3 w-3" /> Arrastra para mover
                    </span>
                  </>
                )}
              </div>

              {/* Brightness & contrast sliders */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Sun className="h-3.5 w-3.5 text-white/60 shrink-0" />
                  <Slider
                    value={[brightness]}
                    min={20}
                    max={200}
                    step={5}
                    onValueChange={([v]) => setBrightness(v)}
                    className="[&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:border-white/40 [&_[role=slider]]:bg-white [&_.relative]:h-1 [&_.absolute]:bg-white/60"
                  />
                  <span className="text-[10px] text-white/50 min-w-[2rem] text-right font-mono">
                    {brightness}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Contrast className="h-3.5 w-3.5 text-white/60 shrink-0" />
                  <Slider
                    value={[contrast]}
                    min={20}
                    max={200}
                    step={5}
                    onValueChange={([v]) => setContrast(v)}
                    className="[&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:border-white/40 [&_[role=slider]]:bg-white [&_.relative]:h-1 [&_.absolute]:bg-white/60"
                  />
                  <span className="text-[10px] text-white/50 min-w-[2rem] text-right font-mono">
                    {contrast}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 px-4 pb-3 pt-1 overflow-x-auto">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    resetView();
                    setCurrentIndex(idx);
                  }}
                  className={cn(
                    "shrink-0 h-12 w-12 rounded-md overflow-hidden border-2 transition-all",
                    idx === currentIndex
                      ? "border-primary ring-1 ring-primary/50 scale-110"
                      : "border-white/20 hover:border-white/50 opacity-60 hover:opacity-100"
                  )}
                >
                  <img
                    src={img.viewUrl}
                    alt={img.fileName}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            <Icon className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
