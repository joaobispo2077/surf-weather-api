import {
	ClassMiddleware,
	Controller,
	Get,
	Middleware,
} from '@overnightjs/core';
import logger from '@src/logger';
import { authMiddleware } from '@src/middlewares/auth';
import { Beach } from '@src/models/beach';
import { Forecast } from '@src/services/forecast';
import ApiError from '@src/util/errors/ApiError';
import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { BaseController } from '.';

const forecast = new Forecast();

const rateLimiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 min
	max: 10,
	keyGenerator(req: Request): string {
		return req.ip;
	},
	handler(_, res: Response): void {
		res.status(429).send(
			ApiError.format({
				code: 429,
				message: 'Too many requests to the /forecast endpoint',
			}),
		);
	},
});
@Controller('forecast')
@ClassMiddleware(authMiddleware)
export class ForecastController extends BaseController {
	@Get('')
	@Middleware(rateLimiter)
	public async getForecastForLoggedUser(
		req: Request,
		res: Response,
	): Promise<void> {
		try {
			const beaches = await Beach.find({ user: req?.decodedToken?.id });
			const forecastData = await forecast.processForecastForBeaches(beaches);
			res.send(forecastData);
		} catch (err: any) {
			logger.error(err);

			this.sendErrorResponse(res, {
				code: 500,
				message: 'Something went wrong',
			});
		}
	}
}
