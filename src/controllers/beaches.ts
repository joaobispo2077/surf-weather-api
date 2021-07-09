import { ClassMiddleware, Controller, Post } from '@overnightjs/core';
import { authMiddleware } from '@src/middlewares/auth';
import { Beach } from '@src/models/beach';
import { Request, Response } from 'express';
import mongoose from 'mongoose';

@Controller('beaches')
@ClassMiddleware(authMiddleware)
export class BeachesController {
	@Post('')
	public async create(req: Request, res: Response): Promise<void> {
		try {
			const beach = new Beach(
				Object.assign({}, req.body, { user: req.decodedToken?.id }),
			);
			const result = await beach.save();
			res.status(201).send(result);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (err: any) {
			if (err instanceof mongoose.Error.ValidationError) {
				res.status(422).send({ error: err.message });
			} else {
				res.status(500).send({ error: 'Internal Server Error' });
			}
		}
	}
}
