export class DateUtil {
  /**
   * Get duration in seconds between 2 dates
   * @param startDate
   * @param endDate
   * @private
   */
  public static getDuration(startDate: Date, endDate: Date): number {
    return (endDate.getTime() - startDate.getTime()) / 1000;
  }
}
