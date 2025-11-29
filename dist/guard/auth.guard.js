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
var _a, _b;
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
        let request = context.switchToHttp().getRequest();
        console.log(request.headers?.AUTHORIZATION);
        const authorization = request.headers?.authorization ||
            request.headers?.Authorization ||
            request.headers?.AUTHORIZATION;
        if (!authorization) {
            throw new common_1.UnauthorizedException('Authorization header missing');
        }
        const [scheme, token] = authorization.split(' ');
        if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
            throw new common_1.UnauthorizedException('Invalid Authorization header format');
        }
        try {
            let payload = this.jwtService.verify(token);
            if (!payload.userId)
                throw new common_1.UnauthorizedException();
            let user = await this.userService.getUserById(payload.userId);
            if (!user)
                throw new common_1.UnauthorizedException();
            this.clsService.set('user', user);
            return true;
        }
        catch (error) {
            throw new common_1.UnauthorizedException();
        }
    }
};
AuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _a : Object, user_service_1.UserService, typeof (_b = typeof nestjs_cls_1.ClsService !== "undefined" && nestjs_cls_1.ClsService) === "function" ? _b : Object])
], AuthGuard);
exports.default = AuthGuard;
//# sourceMappingURL=auth.guard.js.map