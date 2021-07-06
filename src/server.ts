import express, { Application } from 'express';

import { Server } from '@overnightjs/core';
import './util/module-alias';
import { ForecastController } from '@src/controllers/forecast';
import * as database from '@src/database';
import { BeachesController } from '@src/controllers/beaches';
import { UsersController } from './controllers/users';

export class SetupServer extends Server {
	constructor(private port = 3000) {
		super();
	}

	public async init(): Promise<void> {
		this.setupExpress();
		this.setupControllers();
		await this.setupDatabase();
	}

	public getApp(): Application {
		return this.app;
	}

	private setupExpress(): void {
		this.app.use(express.json());
		this.app.use(express.urlencoded({ extended: true }));
	}

	private setupControllers(): void {
		const forecastController = new ForecastController();
		const beachesController = new BeachesController();
		const usersController = new UsersController();

		this.addControllers([
			forecastController,
			beachesController,
			usersController,
		]);
	}

	private async setupDatabase(): Promise<void> {
		await database.connect();
	}

	public async start(): Promise<void> {
		this.app.listen(this.port, () =>
			console.info(`Server is listening of port: ${this.port}`),
		);
	}

	public async close(): Promise<void> {
		await database.close();
	}
}
