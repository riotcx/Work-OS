export const SPRINT_CAPACITY = 20;
export const MAX_DAILY_PRIORITIES = 3;
export const MAX_EN_EJECUCION = 1;

export function formatTime(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
