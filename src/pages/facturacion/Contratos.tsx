import { PageHeader } from "@/components/ui/form-section";
import { PlanTratamientoContrato } from "@/components/expediente/dental/PlanTratamientoContrato";
import { FileSignature } from "lucide-react";

export default function Contratos() {
  return (
    <div className="p-4 md:p-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <PageHeader
          icon={FileSignature}
          title="Contratos y planes de tratamiento"
          description="Gestione los planes de tratamiento aceptados y sus contratos asociados"
        />
        <PlanTratamientoContrato />
      </div>
    </div>
  );
}
