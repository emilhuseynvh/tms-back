"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const user_service_1 = require("../modules/user/user.service");
let WsAuthGuard = class WsAuthGuard {
    jwtService;
    userService;
    constructor(jwtService, userService) {
        this.jwtService = jwtService;
        this.userService = userService;
    }
    async canActivate(context) {
        const client = context.switchToWs().getClient();
        const token = this.extractTokenFromHeader(client.handshake);
        if (!token) {
            throw new common_1.UnauthorizedException('Token tapılmadı!');
        }
        try {
            const payload = this.jwtService.verify(token);
            if (!payload.userId) {
                throw new common_1.UnauthorizedException();
            }
            const user = await this.userService.getUserById(payload.userId);
            if (!user) {
                throw new common_1.UnauthorizedException();
            }
            client.data.user = user;
            return true;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Token etibarsızdır!');
        }
    }
    extractTokenFromHeader(handshake) {
        const authHeader = handshake?.headers?.authorization || handshake?.headers?.Authorization;
        if (authHeader) {
            const [scheme, token] = authHeader.split(' ');
            if (scheme?.toLowerCase() === 'bearer' && token) {
                return token;
            }
        }
        const tokenFromQuery = handshake?.query?.token || handshake?.auth?.token;
        if (tokenFromQuery) {
            return tokenFromQuery;
        }
        return undefined;
    }
};
exports.WsAuthGuard = WsAuthGuard;
exports.WsAuthGuard = WsAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _a : Object, user_service_1.UserService])
], WsAuthGuard);
//# sourceMappingURL=ws-auth.guard.js.map