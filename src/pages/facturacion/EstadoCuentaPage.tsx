import { PageHeader } from "@/components/ui/form-section";
import { EstadoCuenta } from "@/components/expediente/dental/EstadoCuenta";
import { Wallet } from "lucide-react";

export default function EstadoCuentaPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <PageHeader
          icon={Wallet}
          title="Estado de cuenta"
          description="Movimientos financieros, cargos, abonos y saldos del paciente"
        />
        <EstadoCuenta />
      </div>
    </div>
  );
}
