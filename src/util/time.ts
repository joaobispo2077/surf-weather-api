import dayjs from 'dayjs';

export class TimeUtil {
	public static getUnixTimeForAFutureDay(days: number): number {
		return dayjs().add(days, 'day').unix();
	}
}
