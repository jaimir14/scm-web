import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
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
import { User, Camera, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useUserPhotoUrl,
  useRequestUserPhotoPresignedUrl,
  useRegisterUserPhoto,
  useDeleteUserPhoto,
} from "@/services/users.service";
import { uploadFileToSpaces } from "@/services/consultation-images.service";

const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB

interface UserPhotoUploadProps {
  userId: number;
  hasPhoto: boolean;
}

export function UserPhotoUpload({ userId, hasPhoto }: UserPhotoUploadProps) {
  const { data: photoData, isLoading } = useUserPhotoUrl(userId);
  const requestPresignedUrl = useRequestUserPhotoPresignedUrl();
  const registerPhoto = useRegisterUserPhoto();
  const deletePhoto = useDeleteUserPhoto();
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const viewUrl = photoData?.viewUrl;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("La imagen no puede superar 20MB");
      e.target.value = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten archivos de imagen");
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const { uploadUrl, storagePath } = await requestPresignedUrl.mutateAsync({
        userId,
        data: { fileName: file.name, mimeType: file.type, fileSize: file.size },
      });
      await uploadFileToSpaces(uploadUrl, file);
      await registerPhoto.mutateAsync({ userId, storagePath });
      toast.success("Foto actualizada");
    } catch (err: any) {
      toast.error(err?.message || "Error al subir foto");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deletePhoto.mutateAsync(userId);
      toast.success("Foto eliminada");
    } catch (err: any) {
      toast.error(err?.message || "Error al eliminar foto");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
        disabled={uploading}
      />

      {/* Photo display */}
      <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center">
        {isLoading ? (
          <Skeleton className="w-full h-full rounded-full" />
        ) : viewUrl ? (
          <img src={viewUrl} alt="Foto de perfil" className="w-full h-full object-cover" />
        ) : (
          <User className="h-10 w-10 text-muted-foreground/40" />
        )}

        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="h-5 w-5 text-white animate-spin" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera className="h-3 w-3 mr-1" />
          {viewUrl ? "Cambiar" : "Subir foto"}
        </Button>
        {viewUrl && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs text-destructive hover:text-destructive"
            disabled={uploading || deleting}
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar foto de perfil?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
