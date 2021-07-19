import _ from 'lodash';

import { ForecastPoint, StormGlass } from '@src/clients/StormGlass';
import logger from '@src/logger';
import { Beach } from '@src/models/beach';
import { InternalError } from '@src/util/errors/InternalError';
import { Rating } from './rating';

export interface BeachForecast extends Omit<Beach, 'user'>, ForecastPoint {
	rating: number;
}

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
	constructor(
		protected stormGlass = new StormGlass(),
		protected RatingService: typeof Rating = Rating,
	) {}

	// eslint-disable-next-line
	public async processForecastForBeaches(
		beaches: Beach[],
	): Promise<TimeForecast[]> {
		logger.info(`Preparing the forecast for ${beaches.length} beaches`);
		try {
			const pointsWithCorrectSources: BeachForecast[] = [];

			for (const beach of beaches) {
				const rating = new this.RatingService(beach);

				const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng);
				const enrichedBeachData = this.getEnrichedBeachData(
					points,
					beach,
					rating,
				);

				pointsWithCorrectSources.push(...enrichedBeachData);
			}

			const timesForecast = this.mapForecastByTime(pointsWithCorrectSources);

			return timesForecast.map((timeForecast) => ({
				time: timeForecast.time,
				forecast: _.orderBy(timeForecast.forecast, ['rating'], ['desc']),
			}));
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (err: any) {
			logger.error(err);
			throw new ForecastProcessingInternalError(err.message);
		}
	}

	private getEnrichedBeachData(
		points: ForecastPoint[],
		beach: Beach,
		rating: Rating,
	): BeachForecast[] {
		return points.map((point) =>
			Object.assign(point, {
				lat: beach.lat,
				lng: beach.lng,
				name: beach.name,
				position: beach.position,
				rating: rating.getRateForPoint(point),
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
