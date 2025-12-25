"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = __importDefault(require("../../guard/auth.guard"));
const role_decorator_1 = require("./role.decorator");
const role_guard_1 = require("../../guard/role.guard");
const Auth = (...roles) => {
    return (0, common_1.applyDecorators)((0, common_1.UseGuards)(auth_guard_1.default, role_guard_1.RoleGuard), (0, role_decorator_1.Role)(...roles), (0, swagger_1.ApiBearerAuth)());
};
exports.Auth = Auth;
//# sourceMappingURL=auth.decorator.js.map