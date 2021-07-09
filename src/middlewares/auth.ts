import AuthService from '@src/services/auth';
import { NextFunction, Request, Response } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';

export function authMiddleware(
	req: Partial<Request>,
	res: Partial<Response>,
	next: NextFunction,
): void {
	try {
		const token = req.headers?.['x-access-token'];
		const decodedToken = AuthService.decodeToken(token as string);
		req.decodedToken = decodedToken;
		next();
	} catch (err) {
		if (err instanceof JsonWebTokenError) {
			res.status?.(401).send({ code: 401, error: err.message });
		}
	}
}
