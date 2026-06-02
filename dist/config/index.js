"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const dotenv_1 = require("dotenv");
const envPath = (0, path_1.join)(__dirname, '../../.env');
(0, dotenv_1.config)({ path: envPath });
exports.default = {
    dbHost: process.env.DB_HOST,
    dbPort: parseInt(process.env.DB_PORT || '5432', 10),
    dbUsername: process.env.DB_USERNAME,
    dbPassword: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME,
    superSecret: process.env.JWT_SECRET,
    url: process.env.URL,
};
//# sourceMappingURL=index.js.map