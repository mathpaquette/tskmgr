import { formatDuration } from './time.utils';

describe('time.utils', () => {
  describe('formatDuration', () => {
    it('should format duration correctly', () => {
      expect(formatDuration(0.0001)).toBe('<1ms');
      expect(formatDuration(0.001)).toBe('1ms');
      expect(formatDuration(1)).toBe('1s');
      expect(formatDuration(60)).toBe('1m');
      expect(formatDuration(60 + 1)).toBe('1m1s');
      expect(formatDuration(3600)).toBe('1h');
      expect(formatDuration(3600 + 60)).toBe('1h1m');
      expect(formatDuration(86400)).toBe('1d');
      expect(formatDuration(86400 + 3600)).toBe('1d1h');
      expect(formatDuration(2678400)).toBe('1mo');
      expect(formatDuration(2678400 + 86400)).toBe('1mo1d');
      expect(formatDuration(31622400)).toBe('1y');
      expect(formatDuration(31622400 + 2678400)).toBe('1y1mo');
    });
  });
});
