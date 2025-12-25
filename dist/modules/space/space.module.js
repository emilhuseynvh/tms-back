"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpaceModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const space_entity_1 = require("../../entities/space.entity");
const space_service_1 = require("./space.service");
const space_controller_1 = require("./space.controller");
const activity_log_module_1 = require("../activity-log/activity-log.module");
let SpaceModule = class SpaceModule {
};
exports.SpaceModule = SpaceModule;
exports.SpaceModule = SpaceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([space_entity_1.SpaceEntity]),
            activity_log_module_1.ActivityLogModule
        ],
        controllers: [space_controller_1.SpaceController],
        providers: [space_service_1.SpaceService],
        exports: [space_service_1.SpaceService]
    })
], SpaceModule);
//# sourceMappingURL=space.module.js.map