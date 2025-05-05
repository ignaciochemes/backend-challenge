import { DataSource } from 'typeorm';

import * as Dotenv from 'dotenv';
import * as path from 'path';
import { envModelTransformer } from './src/Configs/NestEnvConfig';
import { envFilePathConfiguration } from './src/Configs/EnvFilePathConfig';

let envs;
const envData = Dotenv.config({
    path: `${path.join(process.env.PWD)}/${envFilePathConfiguration()}`,
}).parsed;
console.info(`TYPEORM ENVIRONMENT: ${process.env.BC_ENV}\nDATABASE CONNECTION: ${process.env.DATABASE_HOST}`);
envs = envModelTransformer(envData);

export const connectionSource = new DataSource({
    migrationsTableName: 'migrations',
    type: envs.DATABASE.type,
    host: envs.DATABASE.host,
    port: envs.DATABASE.port,
    username: envs.DATABASE.username,
    password: envs.DATABASE.password,
    database: envs.DATABASE.database,
    logging: envs.DATABASE.logging,
    synchronize: envs.DATABASE.synchronize,
    migrations: ['src/Migrations/**/*.{ts,js}'],
    entities: ['src/Models/Entities/**/*.{ts,js}'],
});

connectionSource
    .initialize()
    .then(() => console.info('Connection to database established'))
    .catch((error) => console.error('TypeORM connection error: ', error));