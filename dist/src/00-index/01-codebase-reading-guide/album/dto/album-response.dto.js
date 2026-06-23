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
exports.AlbumResponseDto = void 0;
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class AlbumResponseDto {
    id;
    title;
    artist;
    coverUrl;
    isDefault;
    userId;
    createdAt;
    updatedAt;
}
exports.AlbumResponseDto = AlbumResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The unique identifier of the album' }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], AlbumResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The title of the album' }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], AlbumResponseDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The artist of the album',
        required: false,
        nullable: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], AlbumResponseDto.prototype, "artist", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The URL to the cover image',
        required: false,
        nullable: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Object)
], AlbumResponseDto.prototype, "coverUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Flag indicating if this is the default album',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], AlbumResponseDto.prototype, "isDefault", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The owner user ID',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], AlbumResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The date when the album was created',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], AlbumResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The date when the album was last updated',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], AlbumResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=album-response.dto.js.map