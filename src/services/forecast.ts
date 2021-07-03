import { ForecastPoint, StormGlass } from '@src/clients/StormGlass';

export enum BeachPosition {
	S = 'S',
	E = 'E',
	W = 'W',
	N = 'N',
}

export interface Beach {
	lat: number;
	lng: number;
	name: string;
	position: BeachPosition;
	user: string;
}

export interface BeachForecast extends Omit<Beach, 'user'>, ForecastPoint {}

export interface TimeForecast {
	time: string;
	forecast: BeachForecast[];
}

export class Forecast {
	constructor(protected stormGlass = new StormGlass()) {}

	// eslint-disable-next-line
  public async processForecastForBeaches(
		beaches: Beach[],
	): Promise<TimeForecast[]> {
		const pointsWithCorrectSources: BeachForecast[] = [];

		for (const beach of beaches) {
			const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng);
			const enrichedBeachData = points.map((point) =>
				Object.assign(point, {
					lat: beach.lat,
					lng: beach.lng,
					name: beach.name,
					position: beach.position,
					rating: 1,
				}),
			);

			pointsWithCorrectSources.push(...enrichedBeachData);
		}

		return this.mapForecastByTime(pointsWithCorrectSources);
	}

	private mapForecastByTime(forecast: BeachForecast[]): TimeForecast[] {
		const forecastByTime: TimeForecast[] = [];

		for (const point of forecast) {
			const timePoint = forecastByTime.find(
				(forecast) => forecast.time === point.time,
			);

			if (timePoint) {
				timePoint.forecast.push(point);
			} else {
				forecastByTime.push({
					time: point.time,
					forecast: [point],
				});
			}
		}

		return forecastByTime;
	}
}
