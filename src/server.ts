import express, { Application } from 'express';

import { Server } from '@overnightjs/core';
import './util/module-alias';

import expressPino from 'express-pino-logger';
import cors from 'cors';
import swaggerUI from 'swagger-ui-express';
import * as OpenApiValidator from 'express-openapi-validator';

import apiSchema from './api.schema.json';
import { ForecastController } from '@src/controllers/forecast';
import * as database from '@src/database';
import { BeachesController } from '@src/controllers/beaches';
import { UsersController } from './controllers/users';
import logger from './logger';
import { OpenAPIV3 } from 'express-openapi-validator/dist/framework/types';
import { apiErrorValidator } from './middlewares/apiErrorValidator';

export class SetupServer extends Server {
	constructor(private port = 3000) {
		super();
	}

	public async init(): Promise<void> {
		this.setupExpress();
		await this.setupDocumentation();

		this.setupControllers();
		await this.setupDatabase();
		this.setupErrorHandlers();
	}

	public getApp(): Application {
		return this.app;
	}

	public async start(): Promise<void> {
		this.app.listen(this.port, () =>
			logger.info(`Server is listening of port: ${this.port}`),
		);
	}

	public async close(): Promise<void> {
		await database.close();
	}

	private setupExpress(): void {
		this.app.use(express.json());
		this.app.use(express.urlencoded({ extended: true }));
		this.app.use(expressPino({ logger }));
		this.app.use(cors({ origin: '*' }));
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

	private async setupDocumentation(): Promise<void> {
		this.app.use('/docs', swaggerUI.serve, swaggerUI.setup(apiSchema));
		this.app.use(
			OpenApiValidator.middleware({
				apiSpec: apiSchema as OpenAPIV3.Document,
				validateRequests: true,
				validateResponses: true,
			}),
		);
	}

	private setupErrorHandlers(): void {
		this.app.use(apiErrorValidator);
	}

	private async setupDatabase(): Promise<void> {
		await database.connect();
	}
}
