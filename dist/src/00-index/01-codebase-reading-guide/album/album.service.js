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
var AlbumService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlbumService = void 0;
const common_1 = require("@nestjs/common");
const album_repository_1 = require("./repositories/album.repository");
let AlbumService = AlbumService_1 = class AlbumService {
    albumRepository;
    logger = new common_1.Logger(AlbumService_1.name);
    constructor(albumRepository) {
        this.albumRepository = albumRepository;
    }
    async create(userId, data) {
        this.logger.log(`Creating new album for user: ${userId}`);
        return this.albumRepository.create({
            ...data,
            userId,
        });
    }
    async findOne(userId, id) {
        this.logger.debug(`Finding album by ID: ${id} for user: ${userId}`);
        return this.albumRepository.findByIdAndUserId(id, userId);
    }
};
exports.AlbumService = AlbumService;
exports.AlbumService = AlbumService = AlbumService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [album_repository_1.AlbumRepository])
], AlbumService);
//# sourceMappingURL=album.service.js.map