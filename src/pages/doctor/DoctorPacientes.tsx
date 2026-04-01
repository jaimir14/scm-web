import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Users, Loader2, User, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useProfessionalPatients, useSearchPatients } from "@/services/patients.service";
import { useDebounce } from "@/hooks/use-debounce";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Patient } from "@/types";

function PatientName(p: Patient) {
  return `${p.nombre} ${p.apellido1}${p.apellido2 ? ` ${p.apellido2}` : ""}`;
}

function PatientList({ patients, isLoading, emptyMessage, onSelect }: {
  patients: Patient[] | undefined;
  isLoading: boolean;
  emptyMessage: string;
  onSelect: (p: Patient) => void;
}) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="divide-y">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-3 space-y-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))
        ) : patients && patients.length > 0 ? (
          patients.map(p => (
            <button
              key={p.id}
              className="w-full text-left p-3 hover:bg-accent/50 active:bg-accent/70 flex items-center gap-3"
              onClick={() => onSelect(p)}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">{PatientName(p)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {p.numeroIdentificacion} · {p.telefonoCelular || p.telefonoCasa || ""}
                </p>
                {p.clinica?.nombre && (
                  <p className="text-xs text-muted-foreground">{p.clinica.nombre}</p>
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          ))
        ) : (
          <div className="p-6 text-center text-muted-foreground text-sm">{emptyMessage}</div>
        )}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Cedula</TableHead>
          <TableHead>Telefono</TableHead>
          <TableHead>Clinica</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-4 w-40" /></TableCell>
              <TableCell><Skeleton className="h-4 w-28" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
            </TableRow>
          ))
        ) : patients && patients.length > 0 ? (
          patients.map(p => (
            <TableRow
              key={p.id}
              className="cursor-pointer hover:bg-accent/50"
              onClick={() => onSelect(p)}
            >
              <TableCell className="font-medium">{PatientName(p)}</TableCell>
              <TableCell>{p.numeroIdentificacion}</TableCell>
              <TableCell>{p.telefonoCelular || p.telefonoCasa || ""}</TableCell>
              <TableCell>{p.clinica?.nombre || ""}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
              {emptyMessage}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export default function DoctorPacientes() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchType, setSearchType] = useState("nombre");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const { data: myPatients, isLoading: loadingMy } = useProfessionalPatients(user?.id);
  const { data: searchResults, isLoading: loadingSearch } = useSearchPatients(debouncedQuery, searchType);

  const handleSelect = (p: Patient) => {
    navigate(`/doctor/expediente/${p.id}`);
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
        <Users className="h-6 w-6 text-primary" />
        Pacientes
      </h1>

      <Tabs defaultValue="mis-pacientes" className="space-y-4">
        <ScrollArea className="w-full">
          <TabsList className="bg-muted inline-flex w-auto min-w-full sm:min-w-0">
            <TabsTrigger value="mis-pacientes" className="text-xs sm:text-sm whitespace-nowrap">
              Mis Pacientes
              {myPatients && <Badge variant="secondary" className="ml-1.5 text-[10px]">{myPatients.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="buscar" className="text-xs sm:text-sm whitespace-nowrap">Buscar Paciente</TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <TabsContent value="mis-pacientes">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" /> Pacientes asignados y atendidos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <PatientList
                patients={myPatients}
                isLoading={loadingMy}
                emptyMessage="No tiene pacientes asignados ni atendidos"
                onSelect={handleSelect}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="buscar">
          <Card className="mb-4">
            <CardContent className="pt-5">
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-end gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Buscar por</label>
                  <Select value={searchType} onValueChange={setSearchType}>
                    <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nombre">Nombre</SelectItem>
                      <SelectItem value="cedula">Cedula</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Paciente</label>
                  <Input
                    placeholder="Digite un texto para buscar..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                  />
                </div>
                {loadingSearch && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <PatientList
                patients={searchResults}
                isLoading={loadingSearch && debouncedQuery.length > 0}
                emptyMessage={query ? "No se encontraron resultados" : "Ingrese un termino de busqueda"}
                onSelect={handleSelect}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
