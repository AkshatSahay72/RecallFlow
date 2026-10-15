export function formatDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '';

  // If it's a date-only string like "YYYY-MM-DD", parse parts directly to avoid UTC timezone shift
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())) {
    const [year, month, day] = dateInput.trim().split('-');
    return `${day}-${month}-${year}`;
  }

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}-${month}-${year}`;
}

export function formatDateTime(dateInput: string | Date | null | undefined): { dateStr: string; timeStr: string } {
  if (!dateInput) return { dateStr: '', timeStr: '' };
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return { dateStr: '', timeStr: '' };

  const dateStr = date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return { dateStr, timeStr };
}

