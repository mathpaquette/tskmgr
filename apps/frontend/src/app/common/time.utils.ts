import { intervalToDuration } from 'date-fns';

export function formatDuration(d: number): string {
  if (!d) return '';
  const duration = intervalToDuration({ start: 0, end: d * 1000 });
  if (duration.hours) return `${duration.hours}h${duration.minutes}m${duration.seconds}s`;
  if (duration.minutes) return `${duration.minutes}m${duration.seconds}s`;
  if (duration.seconds) return `${duration.seconds}s`;
  return `${Math.trunc(d * 1000)}ms`;
}
