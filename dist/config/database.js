"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const _1 = __importDefault(require("."));
const path_1 = require("path");
exports.default = new typeorm_1.DataSource({
    type: 'postgres',
    url: _1.default.databaseUrl,
    entities: [(0, path_1.join)(__dirname, '../entities/*.entity.{ts,js}')],
    migrations: [(0, path_1.join)(__dirname, '../migrations/*.entity.{ts,js}')],
    synchronize: true,
    logging: false
});
//# sourceMappingURL=database.js.map