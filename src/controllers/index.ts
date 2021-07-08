import { Response } from 'express';
import mongoose from 'mongoose';

export abstract class BaseController {
	protected sendCreatedUpdateErrorResponse(
		res: Response,
		err: mongoose.Error.ValidationError | Error,
	): Response {
		if (err instanceof mongoose.Error.ValidationError) {
			return res.status(422).send({ code: 422, error: err.message });
		} else {
			return res.status(500).send({ error: 'Something went wrong!' });
		}
	}
}
