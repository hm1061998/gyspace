/**
 * Converts a date input to a YYYY-MM-DD string formatted for API consumption.
 * Adjusts for local timezone to ensure the date aligns with user selection.
 */
export const formatDateForApi = (
  date: Date | string | number | null | undefined
): string | undefined => {
  if (!date) return undefined;

  const d = new Date(date);
  if (isNaN(d.getTime())) return undefined;

  // Adjust for timezone to get the correct local date part
  const offset = d.getTimezoneOffset();
  const localDate = new Date(d.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split("T")[0];
};
