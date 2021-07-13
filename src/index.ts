import { SetupServer } from './server';
import config from 'config';
import logger from './logger';

enum ExitStatus {
	Failure = 1,
	Success = 0,
}

const port = process.env.PORT || config.get('App.port') || 3000;

(async (): Promise<void> => {
	try {
		const server = new SetupServer(port as number);
		await server.init();
		server.start();

		const exitSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT'];

		exitSignals.forEach((signal) =>
			process.on(signal, async () => {
				try {
					await server.close();
					logger.info('App exited with success');
					process.exit(ExitStatus.Success);
				} catch (err) {
					logger.error(`App exited with error: ${err}`);
					process.exit(ExitStatus.Failure);
				}
			}),
		);
	} catch (err) {
		logger.error(`Application exited with error: ${err}`);
		process.exit(ExitStatus.Failure);
	}
})();
