export interface WeekInfo {
  weekId: string;
  startDate: string;
  endDate: string;
}

const NAV_RANGE = 4;

function toLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function fmt(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getMonday(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function addWeeks(weekId: string, n: number): string {
  const d = toLocalDate(weekId);
  d.setDate(d.getDate() + n * 7);
  return fmt(d);
}

export function getWeekInfo(weekId: string): WeekInfo {
  const start = toLocalDate(weekId);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return { weekId, startDate: fmt(start), endDate: fmt(end) };
}

export function getCurrentWeekId(): string {
  return fmt(getMonday(new Date()));
}

export function getCurrentWeek(): WeekInfo {
  return getWeekInfo(getCurrentWeekId());
}

export function getWeekDays(weekId: string): Date[] {
  const start = toLocalDate(weekId);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

export function isCurrentWeek(weekId: string): boolean {
  return weekId === getCurrentWeekId();
}

export function canNavigate(weekId: string, direction: -1 | 1): boolean {
  const current = getCurrentWeekId();
  const target = addWeeks(weekId, direction);
  const diffMs = toLocalDate(target).getTime() - toLocalDate(current).getTime();
  const diffWeeks = diffMs / (7 * 24 * 60 * 60 * 1000);
  return direction === -1 ? diffWeeks >= -NAV_RANGE : diffWeeks <= NAV_RANGE;
}

export function formatWeekRange(weekId: string): string {
  const { startDate, endDate } = getWeekInfo(weekId);
  const start = toLocalDate(startDate);
  const end = toLocalDate(endDate);
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const sm = months[start.getMonth()];
  const em = months[end.getMonth()];
  const sd = start.getDate();
  const ed = end.getDate();
  if (start.getMonth() === end.getMonth()) {
    return `${sd} ${sm} — ${ed} ${em}`;
  }
  return `${sd} ${sm} — ${ed} ${em}`;
}

export function formatWeekHeader(weekId: string): string {
  const { startDate, endDate } = getWeekInfo(weekId);
  const start = toLocalDate(startDate);
  const end = toLocalDate(endDate);
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const sm = months[start.getMonth()];
  const em = months[end.getMonth()];
  const sd = start.getDate();
  const ed = end.getDate();
  const year = start.getFullYear();
  if (start.getMonth() === end.getMonth()) {
    return `${sd} — ${ed} ${sm} ${year}`;
  }
  return `${sd} ${sm} — ${ed} ${em} ${year}`;
}

export function isSameDay(dateStr: string | null, d: Date): boolean {
  if (!dateStr) return false;
  return dateStr.slice(0, 10) === fmt(d);
}

export function fmtDate(d: Date): string {
  return fmt(d);
}

export const DAY_NAMES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
