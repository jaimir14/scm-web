import { format } from "date-fns";
import { es } from "date-fns/locale";

/** Returns today's date as "yyyy-MM-dd" */
export function todayStr(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/** Returns the current time as "HH:mm" */
export function currentTimeStr(): string {
  return format(new Date(), "HH:mm");
}

/** Converts a Date to "yyyy-MM-dd" for API calls */
export function formatDateToApi(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/** Formats a Date as "dd/MM/yyyy" for display */
export function formatDateDisplay(date: Date): string {
  return format(date, "dd/MM/yyyy");
}

/** Formats a Date as long Spanish string: "lunes 14 de abril, 2026" */
export function formatDateLong(date: Date): string {
  return format(date, "EEEE d 'de' MMMM, yyyy", { locale: es });
}

/** Formats a Date as medium Spanish string: "lunes 14 de abril" (no year) */
export function formatDateMedium(date: Date): string {
  return format(date, "EEEE d 'de' MMMM", { locale: es });
}

/** Extracts the date part "yyyy-MM-dd" from a datetime string */
export function datePart(dateStr: string): string {
  return dateStr.substring(0, 10);
}

/** Formats a "HH:mm" or "HH:mm:ss" string to 12-hour "hh:mm AM/PM" */
export function formatTime(hora: string): string {
  const [h, m] = hora.slice(0, 5).split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${String(h12).padStart(2, "0")}:${m} ${ampm}`;
}

/** Formats a date string + time string as "yyyy-MM-dd - hh:mm AM/PM" */
export function formatDateTime(fecha: string, hora: string): string {
  return `${datePart(fecha)} - ${formatTime(hora)}`;
}

/** Formats an ISO datetime string to a short Spanish locale date */
export function formatLocalDate(dateStr: string): string {
  const [year, month, day] = datePart(dateStr).split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("es");
}

/** Formats an ISO datetime string to a Spanish locale date+time string */
export function formatLocalDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("es");
}

/** Formats an ISO datetime string to "hh:mm" in Spanish locale */
export function formatTimeFromDate(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
}

/** Formats a number with locale thousand separators */
export function formatNumber(n: number): string {
  return n.toLocaleString();
}

/** Formats a number as Costa Rican colones (e.g. ₡1,000) */
export function formatCurrency(amount: number): string {
  return `₡${amount.toLocaleString()}`;
}

/** Formats a file size in bytes to a human-readable string (B / KB / MB) */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
