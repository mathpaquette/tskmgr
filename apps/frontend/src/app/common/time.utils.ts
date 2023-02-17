import { intervalToDuration } from 'date-fns';

export function formatInterval(t1: Date, t2: Date): string {
  if (!t1 || !t2) return '';
  const duration = intervalToDuration({ start: new Date(t1), end: new Date(t2) });
  if (duration.hours) return `${duration.hours}h${duration.minutes}m${duration.seconds}s`;
  if (duration.minutes) return `${duration.minutes}m${duration.seconds}s`;
  if (duration.seconds) return `${duration.seconds}s`;
  return `${Math.trunc(t2.getTime() - t1.getTime())}ms`;
}

export function formatDuration(d: number): string {
  if (!d) return '';
  const duration = intervalToDuration({ start: 0, end: d * 1000 });
  if (duration.hours) return `${duration.hours}h${duration.minutes}m${duration.seconds}s`;
  if (duration.minutes) return `${duration.minutes}m${duration.seconds}s`;
  if (duration.seconds) return `${duration.seconds}s`;
  return `${Math.trunc(d * 1000)}ms`;
}
