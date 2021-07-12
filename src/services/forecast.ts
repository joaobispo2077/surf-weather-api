import { ForecastPoint, StormGlass } from '@src/clients/StormGlass';
import logger from '@src/logger';
import { Beach } from '@src/models/beach';
import { InternalError } from '@src/util/errors/InternalError';

export interface BeachForecast extends Omit<Beach, 'user'>, ForecastPoint {}

export interface TimeForecast {
	time: string;
	forecast: BeachForecast[];
}

export class ForecastProcessingInternalError extends InternalError {
	constructor(message: string) {
		super(`Unexpected error during the forecast processing: ${message}`);
	}
}

export class Forecast {
	constructor(protected stormGlass = new StormGlass()) {}

	// eslint-disable-next-line
	public async processForecastForBeaches(
		beaches: Beach[],
	): Promise<TimeForecast[]> {
		logger.info(`Preparing the forecast for ${beaches.length} beaches`);
		try {
			const pointsWithCorrectSources: BeachForecast[] = [];

			for (const beach of beaches) {
				const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng);
				const enrichedBeachData = this.getEnrichedBeachData(points, beach);

				pointsWithCorrectSources.push(...enrichedBeachData);
			}

			return this.mapForecastByTime(pointsWithCorrectSources);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (err: any) {
			logger.error(err);
			throw new ForecastProcessingInternalError(err.message);
		}
	}

	private getEnrichedBeachData(
		points: ForecastPoint[],
		beach: Beach,
	): BeachForecast[] {
		return points.map((point) =>
			Object.assign(point, {
				lat: beach.lat,
				lng: beach.lng,
				name: beach.name,
				position: beach.position,
				rating: 1,
			}),
		);
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
