import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { X, Download, ExternalLink, Loader2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface PdfViewerProps {
  url: string | undefined;
  fileName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PdfViewer({ url, fileName, open, onOpenChange }: PdfViewerProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) setLoading(true);
  }, [open, url]);

  const handleDownload = () => {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.target = "_blank";
    a.click();
  };

  const handleOpenExternal = () => {
    if (!url) return;
    window.open(url, "_blank");
  };

  // Keyboard
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  if (!url) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[100vw] max-h-[100vh] w-screen h-screen p-0 border-none bg-background gap-0 rounded-none sm:rounded-none [&>button]:hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-3 md:px-4 py-2.5 border-b bg-card shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-medium text-foreground truncate max-w-[200px] sm:max-w-[400px]">
              {fileName}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleOpenExternal}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">Abrir en nueva pestaña</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownload}>
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">Descargar</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenChange(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">Cerrar (Esc)</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* PDF iframe */}
        <div className="relative flex-1 w-full h-[calc(100vh-49px)]">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10 gap-3">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Cargando documento…</p>
            </div>
          )}
          <iframe
            src={url}
            title={fileName}
            className="w-full h-full border-0"
            onLoad={() => setLoading(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
