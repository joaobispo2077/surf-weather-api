import { CUSTOM_VALIDATION } from '@src/models/user';
import { Response } from 'express';
import mongoose from 'mongoose';

export abstract class BaseController {
	protected sendCreatedUpdateErrorResponse(
		res: Response,
		error: mongoose.Error.ValidationError | Error,
	): Response {
		if (error instanceof mongoose.Error.ValidationError) {
			const duplicatedKindErrors = Object.values(error.errors).filter((err) => {
				if (
					err instanceof mongoose.Error.ValidatorError ||
					err instanceof mongoose.Error.CastError
				) {
					return err.kind === CUSTOM_VALIDATION.DUPLICATED;
				} else {
					return null;
				}
			});
			console.log(duplicatedKindErrors.length);

			if (duplicatedKindErrors.length) {
				return res.status(409).send({ code: 409, error: error.message });
			} else {
				return res.status(422).send({ code: 422, error: error.message });
			}
		} else {
			return res.status(500).send({ error: 'Something went wrong!' });
		}
	}
}
