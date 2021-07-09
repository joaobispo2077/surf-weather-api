import AuthService from '@src/services/auth';
import { NextFunction, Request, Response } from 'express';

export function authMiddleware(
	req: Partial<Request>,
	_: Partial<Response>,
	next: NextFunction,
): void {
	const token = req.headers?.['x-access-token'];
	const decodedToken = AuthService.decodeToken(token as string);
	req.decodedToken = decodedToken;
	next();
}
