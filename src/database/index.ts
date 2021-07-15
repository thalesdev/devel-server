import dotenv from 'dotenv';
import {
	createConnection,
	getConnectionOptions,
	ConnectionOptions,
} from 'typeorm';

dotenv.config();

const getOptions = async () => {
	let connectionOptions: ConnectionOptions;
	connectionOptions = {
		type: 'mongodb',
		synchronize: false,
		logging: false,
		entities: ['dist/models/*.*'],
	};
	if (process.env.DATABASE_URL) {
		Object.assign(connectionOptions, { url: process.env.DATABASE_URL });
	} else {
		connectionOptions = await getConnectionOptions();
	}

	return connectionOptions;
};

const connect2Database = async (): Promise<void> => {
	const typeormconfig = await getOptions();
	await createConnection(typeormconfig);
};

connect2Database();
