import { differenceInDays, differenceInMonths, differenceInYears, format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * For tables: human-friendly relative labels.
 *
 * - Hoy
 * - Ayer
 * - Hace X días  (2–29 días)
 * - Hace X meses (1–11 meses)
 * - Hace X años  (≥ 12 meses)
 */
export function formatTableTime(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const now  = new Date();

  if (isToday(date))     return 'Hoy';
  if (isYesterday(date)) return 'Ayer';

  const days   = differenceInDays(now, date);
  if (days < 30) return `Hace ${days} día${days === 1 ? '' : 's'}`;

  const months = differenceInMonths(now, date);
  if (months < 12) return `Hace ${months} mes${months === 1 ? '' : 'es'}`;

  const years = differenceInYears(now, date);
  return `Hace ${years} año${years === 1 ? '' : 's'}`;
}

/**
 * For metric cards: exact time + label for today/yesterday,
 * exact time + exact date otherwise.
 *
 * Returns { label: 'HOY' | 'AYER' | 'dd/MM/yyyy', time: 'HH:mm' }
 */
export function formatMetricTime(dateInput: string | Date): { label: string; time: string } {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

  const time = format(date, 'HH:mm', { locale: es });

  if (isToday(date))     return { label: 'HOY',  time };
  if (isYesterday(date)) return { label: 'AYER', time };

  return {
    label: format(date, 'dd/MM/yyyy', { locale: es }),
    time,
  };
}
