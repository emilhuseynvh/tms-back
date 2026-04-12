import { DataSource } from "typeorm";
import config from ".";
import { join } from "path";

export default new DataSource({
    type: 'postgres',
    host: config.dbHost,
    port: config.dbPort,
    username: config.dbUsername,
    password: config.dbPassword,
    database: config.dbName,
    entities: [join(__dirname, '../entities/*.entity.{ts,js}')],
    migrations: [join(__dirname, '../migrations/*.entity.{ts,js}')],
    synchronize: true,
    logging: false
})