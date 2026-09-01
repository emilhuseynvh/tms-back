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
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const nestjs_cls_1 = require("nestjs-cls");
const user_service_1 = require("../modules/user/user.service");
let AuthGuard = class AuthGuard {
    jwtService;
    userService;
    clsService;
    constructor(jwtService, userService, clsService) {
        this.jwtService = jwtService;
        this.userService = userService;
        this.clsService = clsService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const raw = request.headers?.authorization ||
            request.headers?.Authorization ||
            request.headers?.AUTHORIZATION;
        const authorization = Array.isArray(raw) ? raw[0] : raw;
        if (!authorization || typeof authorization !== 'string') {
            throw new common_1.UnauthorizedException('Authorization header missing');
        }
        const [scheme, ...tokenParts] = authorization.trim().split(/\s+/);
        const token = tokenParts.join(' ').trim();
        if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
            throw new common_1.UnauthorizedException('Invalid Authorization header format');
        }
        let payload;
        try {
            payload = this.jwtService.verify(token);
        }
        catch {
            throw new common_1.UnauthorizedException('Token etibarsızdır və ya müddəti bitib');
        }
        const userId = payload?.userId ?? payload?.sub ?? payload?.id;
        if (userId == null || userId === '') {
            throw new common_1.UnauthorizedException();
        }
        const user = await this.userService.findForAuth(userId);
        if (!user) {
            throw new common_1.UnauthorizedException();
        }
        request.user = user;
        if (this.clsService.isActive()) {
            this.clsService.set('user', user);
        }
        return true;
    }
};
AuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        user_service_1.UserService,
        nestjs_cls_1.ClsService])
], AuthGuard);
exports.default = AuthGuard;
//# sourceMappingURL=auth.guard.js.map