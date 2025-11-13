import { intervalToDuration } from 'date-fns';

/**
 * Formats a duration given in seconds into a human-readable string.
 * @param d Duration in seconds
 * @returns Formatted duration string
 */
export function formatDuration(d: number): string {
  if (!d) return '';
  const duration = intervalToDuration({ start: 0, end: d * 1000 });
  if (duration.years) return `${duration.years}y` + `${duration.months ? `${duration.months}mo` : ''}`;
  if (duration.months) return `${duration.months}mo` + `${duration.days ? `${duration.days}d` : ''}`;
  if (duration.days) return `${duration.days}d` + `${duration.hours ? `${duration.hours}h` : ''}`;
  if (duration.hours) return `${duration.hours}h` + `${duration.minutes ? `${duration.minutes}m` : ''}`;
  if (duration.minutes) return `${duration.minutes}m` + `${duration.seconds ? `${duration.seconds}s` : ''}`;
  if (duration.seconds) return `${duration.seconds}s`;
  const milliseconds = Math.trunc(d * 1000);
  return milliseconds > 0 ? `${milliseconds}ms` : '<1ms';
}
