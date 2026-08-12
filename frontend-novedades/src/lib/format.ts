/**
 * Formatea una fecha ISO (YYYY-MM-DD) al formato colombiano DD/MM/YYYY.
 *
 * Se parte la cadena en lugar de usar `new Date()` porque este último
 * interpreta las fechas sin hora como UTC y puede correr el día según la
 * zona horaria del navegador.
 */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

/** Rango de fechas legible; un solo día se muestra sin repetir la fecha. */
export function formatDateRange(startDate: string, endDate: string): string {
  return startDate === endDate
    ? formatDate(startDate)
    : `${formatDate(startDate)} al ${formatDate(endDate)}`;
}
