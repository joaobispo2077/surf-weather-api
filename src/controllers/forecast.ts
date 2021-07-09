import { ClassMiddleware, Controller, Get } from '@overnightjs/core';
import { authMiddleware } from '@src/middlewares/auth';
import { Beach } from '@src/models/beach';
import { Forecast } from '@src/services/forecast';
import { Request, Response } from 'express';

const forecast = new Forecast();
@Controller('forecast')
@ClassMiddleware(authMiddleware)
export class ForecastController {
	@Get('')
	public async getForecastForLoggedUser(
		req: Request,
		res: Response,
	): Promise<void> {
		try {
			const beaches = await Beach.find({ user: req.decodedToken?.id });
			const forecastData = await forecast.processForecastForBeaches(beaches);
			res.send(forecastData);
		} catch (err: any) {
			console.error(err);

			res.status(500).send({ error: 'Something went wrong' });
		}
	}
}
