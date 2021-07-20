import ApiError from '@src/util/errors/ApiError';
import { NextFunction, Request, Response } from 'express';
import { HttpError } from 'express-openapi-validator/dist/framework/types';

export function apiErrorValidator(
	error: HttpError,
	_: Partial<Request>,
	res: Response,
	__: NextFunction,
): void {
	const errorCode = error.status || 500;

	res
		.status(errorCode)
		.json(ApiError.format({ code: errorCode, message: error.message }));
}
