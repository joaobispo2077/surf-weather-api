import express, { Application } from 'express';

import { Server } from '@overnightjs/core';
import '@src/util/module-alias';
import { ForecastController } from './controllers/forecast';
import * as database from '@src/database';
import { BeachesController } from './controllers/beaches';

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
		this.addControllers([forecastController, beachesController]);
	}

	private async setupDatabase(): Promise<void> {
		await database.connect();
	}

	public async close(): Promise<void> {
		await database.close();
	}
}
