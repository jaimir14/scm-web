import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, FileText, Trash2, Eye, Upload, Download, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useConsultationFiles,
  useRequestFilePresignedUrl,
  useRegisterFile,
  useDeletePatientFile,
  uploadPatientFile,
} from "@/services/patient-files.service";
import { PdfViewer } from "@/components/PdfViewer";

interface ConsultationFilesProps {
  consultaId: number | undefined;
  patientId: number;
  editable: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ConsultationFiles({
  consultaId,
  patientId,
  editable,
}: ConsultationFilesProps) {
  const { data: files = [], isLoading } = useConsultationFiles(consultaId);
  const requestPresignedUrl = useRequestFilePresignedUrl();
  const registerFile = useRegisterFile();
  const deleteFile = useDeletePatientFile();
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [viewerFile, setViewerFile] = useState<{ url: string; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 20 * 1024 * 1024;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles?.length) return;
    if (!consultaId) {
      toast.error("Guarde la consulta antes de subir archivos");
      return;
    }

    for (const file of Array.from(selectedFiles)) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" supera el límite de 20MB`);
        e.target.value = "";
        return;
      }
      if (file.type !== "application/pdf") {
        toast.error(`"${file.name}" no es un PDF válido`);
        e.target.value = "";
        return;
      }
    }

    setUploading(true);
    try {
      for (const file of Array.from(selectedFiles)) {
        await uploadPatientFile(
          file,
          { pacienteId: patientId, consultaId },
          requestPresignedUrl,
          registerFile
        );
      }
      toast.success(
        selectedFiles.length === 1
          ? "Archivo subido correctamente"
          : `${selectedFiles.length} archivos subidos correctamente`
      );
    } catch (err: any) {
      toast.error(err?.message || "Error al subir archivo");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(deleteTarget.id);
    try {
      await deleteFile.mutateAsync(deleteTarget.id);
      toast.success("Archivo eliminado");
    } catch (err: any) {
      toast.error(err?.message || "Error al eliminar archivo");
    } finally {
      setDeleting(null);
      setDeleteTarget(null);
    }
  };

  const handleDownload = (url: string, name: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.target = "_blank";
    a.click();
  };

  if (!consultaId) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg border border-dashed border-border bg-muted/30">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">
          Guarde la consulta primero para adjuntar archivos.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <Label className="text-sm font-semibold">Resultados de Laboratorio</Label>
          {files.length > 0 && (
            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
              {files.length}
            </span>
          )}
        </div>
        {editable && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              multiple
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
            <Button
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="h-8 text-xs gap-1.5"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              Subir PDF
            </Button>
          </>
        )}
      </div>

      {/* File list */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : files.length === 0 ? (
        <div
          className={cn(
            "flex flex-col items-center justify-center py-6 rounded-lg border border-dashed border-border bg-muted/20 gap-2",
            editable && "cursor-pointer hover:bg-muted/40 transition-colors"
          )}
          onClick={() => editable && fileInputRef.current?.click()}
        >
          <File className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-xs text-muted-foreground">
            {editable ? "Click para subir archivos PDF" : "Sin archivos adjuntos"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((f) => (
            <div
              key={f.id}
              className="group flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:shadow-sm hover:border-primary/20 transition-all"
            >
              {/* Icon */}
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-destructive/10 shrink-0">
                <FileText className="h-5 w-5 text-destructive" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{f.fileName}</p>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span>{formatFileSize(f.fileSize)}</span>
                  {f.createdAt && (
                    <>
                      <span className="text-muted-foreground/40">•</span>
                      <span>{new Date(f.createdAt).toLocaleDateString("es")}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                  onClick={() => f.viewUrl && setViewerFile({ url: f.viewUrl, name: f.fileName })}
                  disabled={!f.viewUrl}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                  onClick={() => f.viewUrl && handleDownload(f.viewUrl, f.fileName)}
                  disabled={!f.viewUrl}
                >
                  <Download className="h-4 w-4" />
                </Button>
                {editable && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteTarget({ id: f.id, name: f.fileName })}
                    disabled={deleting === f.id}
                  >
                    {deleting === f.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PDF Viewer */}
      <PdfViewer
        url={viewerFile?.url}
        fileName={viewerFile?.name ?? ""}
        open={!!viewerFile}
        onOpenChange={(open) => !open && setViewerFile(null)}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar archivo?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará <span className="font-medium text-foreground">"{deleteTarget?.name}"</span>. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={!!deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
