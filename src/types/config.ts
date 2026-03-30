export interface SystemConfig {
  nombreSistema?: string;
  zonaHoraria?: string;
  formatoFecha?: string;
  duracionCitaDefecto?: number;
  horaInicioJornada?: string;
  horaFinJornada?: string;
  restriccionHorario?: boolean;
  registrarBitacora?: boolean;
  cambioPasswordDias?: number;
  tiempoInactividad?: number;
  enviarRecordatorioEmail?: boolean;
  notificarMedicoCitas?: boolean;
}
