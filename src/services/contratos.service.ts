import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  Contrato,
  ContratoQuery,
  CreateContratoInput,
  UpdateContratoInput,
  AddTratamientoInput,
  UpdateTratamientoItemInput,
  RegistrarPagoInput,
  EditarPagoInput,
  AnularPagoInput,
  CambiarEstadoInput,
} from "@/types/contrato";

const CONTRATOS_KEY = "contratos";

export function useContratos(query?: ContratoQuery) {
  return useQuery({
    queryKey: [CONTRATOS_KEY, query],
    queryFn: () => {
      const params = new URLSearchParams();
      if (query?.page) params.set("page", String(query.page));
      if (query?.limit) params.set("limit", String(query.limit));
      if (query?.q) params.set("q", query.q);
      if (query?.estado) params.set("estado", query.estado);
      if (query?.pacienteId) params.set("pacienteId", String(query.pacienteId));
      if (query?.dentistaId) params.set("dentistaId", String(query.dentistaId));
      const qs = params.toString();
      return api.getPaginated<Contrato>(`/api/v1/contratos${qs ? `?${qs}` : ""}`);
    },
  });
}

export function useContrato(id: string) {
  return useQuery({
    queryKey: [CONTRATOS_KEY, id],
    queryFn: () => api.get<Contrato>(`/api/v1/contratos/${id}`),
    enabled: !!id,
  });
}

export function useContratosByPaciente(pacienteId: number) {
  return useQuery({
    queryKey: [CONTRATOS_KEY, "paciente", pacienteId],
    queryFn: () => api.get<Contrato[]>(`/api/v1/contratos/paciente/${pacienteId}`),
    enabled: !!pacienteId,
  });
}

export function useCreateContrato() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateContratoInput) =>
      api.post<Contrato>("/api/v1/contratos", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONTRATOS_KEY] });
    },
  });
}

export function useUpdateContrato() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & UpdateContratoInput) =>
      api.put<Contrato>(`/api/v1/contratos/${id}`, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [CONTRATOS_KEY] });
      queryClient.invalidateQueries({ queryKey: [CONTRATOS_KEY, variables.id] });
    },
  });
}

export function useCambiarEstado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & CambiarEstadoInput) =>
      api.put<Contrato>(`/api/v1/contratos/${id}/estado`, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [CONTRATOS_KEY] });
      queryClient.invalidateQueries({ queryKey: [CONTRATOS_KEY, variables.id] });
    },
  });
}

export function useDeleteContrato() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/contratos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONTRATOS_KEY] });
    },
  });
}

export function useAddTratamiento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & AddTratamientoInput) =>
      api.post<Contrato>(`/api/v1/contratos/${id}/tratamientos`, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [CONTRATOS_KEY] });
      queryClient.invalidateQueries({ queryKey: [CONTRATOS_KEY, variables.id] });
    },
  });
}

export function useUpdateTratamientoItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, itemId, ...body }: { id: string; itemId: string } & UpdateTratamientoItemInput) =>
      api.put<Contrato>(`/api/v1/contratos/${id}/tratamientos/${itemId}`, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [CONTRATOS_KEY] });
      queryClient.invalidateQueries({ queryKey: [CONTRATOS_KEY, variables.id] });
    },
  });
}

export function useRemoveTratamiento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, itemId }: { id: string; itemId: string }) =>
      api.delete<Contrato>(`/api/v1/contratos/${id}/tratamientos/${itemId}`),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [CONTRATOS_KEY] });
      queryClient.invalidateQueries({ queryKey: [CONTRATOS_KEY, variables.id] });
    },
  });
}

export function useRegistrarPago() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & RegistrarPagoInput) =>
      api.post<Contrato>(`/api/v1/contratos/${id}/pagos`, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [CONTRATOS_KEY] });
      queryClient.invalidateQueries({ queryKey: [CONTRATOS_KEY, variables.id] });
    },
  });
}

export function useEditarPago() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, pagoId, ...body }: { id: string; pagoId: string } & EditarPagoInput) =>
      api.put<Contrato>(`/api/v1/contratos/${id}/pagos/${pagoId}`, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [CONTRATOS_KEY] });
      queryClient.invalidateQueries({ queryKey: [CONTRATOS_KEY, variables.id] });
    },
  });
}

export function useAnularPago() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, pagoId, ...body }: { id: string; pagoId: string } & AnularPagoInput) =>
      api.put<Contrato>(`/api/v1/contratos/${id}/pagos/${pagoId}/anular`, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [CONTRATOS_KEY] });
      queryClient.invalidateQueries({ queryKey: [CONTRATOS_KEY, variables.id] });
    },
  });
}
