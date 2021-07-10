import { SetupServer } from './server';
import config from 'config';

const port = process.env.PORT || config.get('App.port') || 3000;

(async (): Promise<void> => {
	const server = new SetupServer(port as number);
	await server.init();
	server.start();
})();
