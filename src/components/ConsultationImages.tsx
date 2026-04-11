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
import { Loader2, ImagePlus, Trash2, Eye, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useConsultationImages,
  useRequestPresignedUrl,
  useRegisterImage,
  useDeleteConsultationImage,
  uploadFileToSpaces,
} from "@/services/consultation-images.service";
import { MedicalImageViewer } from "@/components/MedicalImageViewer";

interface ConsultationImagesProps {
  consultaId: number | undefined;
  patientId: number;
  citaId?: number;
  editable: boolean;
}

export function ConsultationImages({
  consultaId,
  patientId,
  citaId,
  editable,
}: ConsultationImagesProps) {
  const { data: images = [], isLoading } = useConsultationImages(consultaId);
  const requestPresignedUrl = useRequestPresignedUrl();
  const registerImage = useRegisterImage();
  const deleteImage = useDeleteConsultationImage();
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    if (!consultaId) {
      toast.error("Guarde la consulta antes de subir imágenes");
      return;
    }
    if (!citaId) {
      toast.error("No se encontró la cita asociada");
      return;
    }

    for (const file of Array.from(files)) {
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(`"${file.name}" supera el limite de 20MB`);
        e.target.value = "";
        return;
      }
    }

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const { uploadUrl, storagePath } = await requestPresignedUrl.mutateAsync({
          pacienteId: patientId,
          citaId,
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
        });
        await uploadFileToSpaces(uploadUrl, file);
        await registerImage.mutateAsync({
          consultaId,
          fileName: file.name,
          storagePath,
          fileSize: file.size,
          mimeType: file.type,
        });
      }
      toast.success("Imagen(es) subida(s) correctamente");
    } catch (err: any) {
      toast.error(err?.message || "Error al subir imagen");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(deleteTarget.id);
    try {
      await deleteImage.mutateAsync(deleteTarget.id);
      toast.success("Imagen eliminada");
    } catch (err: any) {
      toast.error(err?.message || "Error al eliminar imagen");
    } finally {
      setDeleting(null);
      setDeleteTarget(null);
    }
  };

  if (!consultaId) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg border border-dashed border-border bg-muted/30">
        <ImagePlus className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">
          Guarde la consulta primero para adjuntar imágenes.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImagePlus className="h-4 w-4 text-primary" />
          <Label className="text-sm font-semibold">Imágenes</Label>
          {images.length > 0 && (
            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
              {images.length}
            </span>
          )}
        </div>
        {editable && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
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
              Subir
            </Button>
          </>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div
          className={cn(
            "flex flex-col items-center justify-center py-6 rounded-lg border border-dashed border-border bg-muted/20 gap-2",
            editable && "cursor-pointer hover:bg-muted/40 transition-colors"
          )}
          onClick={() => editable && fileInputRef.current?.click()}
        >
          <ImagePlus className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-xs text-muted-foreground">
            {editable ? "Click para subir imágenes" : "Sin imágenes adjuntas"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((img, idx) => (
            <div
              key={img.id}
              className="group relative aspect-square rounded-lg overflow-hidden border border-border bg-muted/30 transition-shadow hover:shadow-md hover:border-primary/30"
            >
              <img
                src={img.viewUrl}
                alt={img.fileName}
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  className="bg-black/50 backdrop-blur-sm text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                  onClick={() => {
                    setViewerIndex(idx);
                    setViewerOpen(true);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
              {/* File name */}
              <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[9px] text-white truncate font-medium">
                  {img.fileName}
                </p>
              </div>
              {/* Delete button */}
              {editable && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget({ id: img.id, name: img.fileName });
                  }}
                  disabled={deleting === img.id}
                  className="absolute top-1 right-1 rounded-full p-1 transition-all opacity-0 group-hover:opacity-100 bg-black/40 text-white/80 hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
                >
                  {deleting === img.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Medical Image Viewer */}
      <MedicalImageViewer
        images={images}
        initialIndex={viewerIndex}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar imagen?</AlertDialogTitle>
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
