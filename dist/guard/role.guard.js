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
exports.RoleGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const nestjs_cls_1 = require("nestjs-cls");
let RoleGuard = class RoleGuard {
    cls;
    reflector;
    constructor(cls, reflector) {
        this.cls = cls;
        this.reflector = reflector;
    }
    async canActivate(context) {
        const user = this.cls.get('user');
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        const roles = this.reflector.get('roles', context.getHandler());
        if (!roles || !roles.length)
            return true;
        const hasRole = roles.some(role => user.role === role);
        if (!hasRole)
            throw new common_1.ForbiddenException('You do not have the necessary role');
        return true;
    }
};
exports.RoleGuard = RoleGuard;
exports.RoleGuard = RoleGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof nestjs_cls_1.ClsService !== "undefined" && nestjs_cls_1.ClsService) === "function" ? _a : Object, typeof (_b = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _b : Object])
], RoleGuard);
//# sourceMappingURL=role.guard.js.map