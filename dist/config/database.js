"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const _1 = __importDefault(require("."));
const path_1 = require("path");
exports.default = new typeorm_1.DataSource({
    type: 'mysql',
    host: _1.default.dbHost,
    port: _1.default.dbPort,
    username: _1.default.dbUsername,
    password: _1.default.dbPassword,
    database: _1.default.dbName,
    entities: [(0, path_1.join)(__dirname, '../entities/*.entity.{ts,js}')],
    migrations: [(0, path_1.join)(__dirname, '../migrations/*.entity.{ts,js}')],
    synchronize: true,
    logging: false
});
//# sourceMappingURL=database.js.map