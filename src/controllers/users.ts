import { Controller, Post } from '@overnightjs/core';
import { User } from '@src/models/user';
import { Request, Response } from 'express';

@Controller('users')
export class UsersController {
	@Post('')
	public async create(req: Request, res: Response): Promise<void> {
		try {
			const user = new User(req.body);
			const newUser = await user.save();
			res.status(201).send(newUser);
		} catch (err: any) {
			res.status(400).send({ error: err.message });
		}
	}
}
