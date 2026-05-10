import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FormSection } from "@/components/ui/form-section";
import { MedicalImageViewer } from "@/components/MedicalImageViewer";
import { Camera, Plus, Eye } from "lucide-react";
import { toast } from "sonner";

type ImgKind = "intraoral" | "externa" | "radiografia" | "otro";

interface DentalImage {
  id: string;
  kind: ImgKind;
  url: string;
  fecha: string;
  observacion?: string;
}

const KIND_LABEL: Record<ImgKind, string> = {
  intraoral: "Intraorales",
  externa: "Externas",
  radiografia: "Radiografías",
  otro: "Otros",
};

const SAMPLE: DentalImage[] = [
  { id: "1", kind: "intraoral",   url: "/placeholder.svg", fecha: "2026-04-12", observacion: "Vista oclusal superior" },
  { id: "2", kind: "radiografia", url: "/placeholder.svg", fecha: "2026-04-12", observacion: "Periapical 26" },
  { id: "3", kind: "externa",     url: "/placeholder.svg", fecha: "2026-04-15", observacion: "Frontal sonrisa" },
];

export function ImagenesClinicas() {
  const [images] = useState<DentalImage[]>(SAMPLE);
  const [viewer, setViewer] = useState<{ open: boolean; index: number }>({ open: false, index: 0 });
  const [filter, setFilter] = useState<ImgKind | "all">("all");

  const list = filter === "all" ? images : images.filter(i => i.kind === filter);

  return (
    <FormSection
      icon={Camera}
      title="Imágenes clínicas"
      description="Fotografías intraorales, externas, radiografías y otros"
      actions={<Button size="sm" onClick={() => toast.info("Subir imagen")}><Plus className="h-4 w-4 mr-1.5" /> Agregar</Button>}
    >
      <Tabs value={filter} onValueChange={(v) => setFilter(v as ImgKind | "all")}>
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          {(Object.keys(KIND_LABEL) as ImgKind[]).map(k => (
            <TabsTrigger key={k} value={k}>{KIND_LABEL[k]}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={filter} className="mt-4">
          {list.length === 0 ? (
            <div className="text-center py-10 text-sm text-muted-foreground">Sin imágenes en esta categoría</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {list.map((img, idx) => (
                <button
                  key={img.id}
                  className="group relative rounded-lg border bg-card overflow-hidden hover:shadow-md transition text-left"
                  onClick={() => setViewer({ open: true, index: idx })}
                >
                  <div className="aspect-square bg-muted overflow-hidden">
                    <img src={img.url} alt={img.observacion || "Imagen"} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  </div>
                  <div className="p-2 space-y-1">
                    <Badge variant="outline" className="text-[10px]">{KIND_LABEL[img.kind]}</Badge>
                    <p className="text-xs text-muted-foreground truncate">{img.observacion}</p>
                    <p className="text-[10px] text-muted-foreground">{img.fecha}</p>
                  </div>
                  <div className="absolute top-1.5 right-1.5 h-7 w-7 rounded-md bg-background/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <Eye className="h-3.5 w-3.5" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {viewer.open && (
        <MedicalImageViewer
          images={list.map(i => ({ url: i.url, name: i.observacion || "" }))}
          initialIndex={viewer.index}
          open={viewer.open}
          onOpenChange={(o) => setViewer(v => ({ ...v, open: o }))}
        />
      )}
    </FormSection>
  );
}
