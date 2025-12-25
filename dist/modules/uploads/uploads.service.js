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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UplaodsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const uploads_entity_1 = require("../../entities/uploads.entity");
const typeorm_2 = require("@nestjs/typeorm");
const config_1 = __importDefault(require("../../config"));
let UplaodsService = class UplaodsService {
    imageRepo;
    constructor(imageRepo) {
        this.imageRepo = imageRepo;
    }
    async saveFile(file) {
        let result = await this.imageRepo.save({
            url: config_1.default.url + '/uploads/' + file.filename,
        });
        return result;
    }
};
exports.UplaodsService = UplaodsService;
exports.UplaodsService = UplaodsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(uploads_entity_1.UploadsEntity)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], UplaodsService);
//# sourceMappingURL=uploads.service.js.map