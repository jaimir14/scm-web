import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchPatients } from "@/services/patients.service";
import { useDebounce } from "@/hooks/use-debounce";

export default function BuscarExpediente() {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState("nombre");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const { data: results, isLoading } = useSearchPatients(debouncedQuery, searchType);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Busqueda de Expediente</h1>

      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Buscar por</label>
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nombre">Nombre</SelectItem>
                  <SelectItem value="cedula">Cedula</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px] space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Paciente</label>
              <Input
                placeholder="Digite un texto para buscar..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
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
              ) : results && results.length > 0 ? (
                results.map(p => (
                  <TableRow
                    key={p.id}
                    className="cursor-pointer hover:bg-accent/50"
                    onClick={() => navigate(`/expediente/${p.id}`)}
                  >
                    <TableCell className="font-medium">
                      {p.nombre} {p.apellido1} {p.apellido2 || ""}
                    </TableCell>
                    <TableCell>{p.numeroIdentificacion}</TableCell>
                    <TableCell>{p.telefonoCelular || p.telefonoCasa || ""}</TableCell>
                    <TableCell>{p.clinica?.nombre || ""}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    {query ? "No se encontraron resultados" : "Ingrese un termino de busqueda"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
