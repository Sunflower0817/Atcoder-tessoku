function toJstDate(date: string): Date {
  return new Date(`${date}T00:00:00+09:00`);
}

export function getWeekday(date: string): number {
  return toJstDate(date).getUTCDay();
}

export function addDays(date: string, days: number): string {
  const base = toJstDate(date);
  base.setUTCDate(base.getUTCDate() + days);
  return base.toISOString().slice(0, 10);
}

export function isBusinessDay(date: string): boolean {
  const weekday = getWeekday(date);
  return weekday !== 0 && weekday !== 6;
}

export function subtractBusinessDays(date: string, days: number): string {
  let current = date;
  let remaining = days;
  while (remaining > 0) {
    current = addDays(current, -1);
    if (isBusinessDay(current)) {
      remaining -= 1;
    }
  }
  return current;
}

export function isPastThreeBusinessDayDeadline(targetDate: string, now = new Date()): boolean {
  const deadlineDate = subtractBusinessDays(targetDate, 3);
  const deadline = new Date(`${deadlineDate}T15:00:00+09:00`);
  return now.getTime() > deadline.getTime();
}
