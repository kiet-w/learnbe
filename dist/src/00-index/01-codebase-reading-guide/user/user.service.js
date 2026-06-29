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
exports.UserService = void 0;
const respone_user_dto_1 = require("./dto/respone-user.dto");
const prisma_service_1 = require("../../../prisma/prisma.service");
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
let UserService = class UserService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createUserDto) {
        const newUser = await this.prisma.user.create({
            data: {
                ...createUserDto,
            },
        });
        return (0, class_transformer_1.plainToInstance)(respone_user_dto_1.ResponeUserDto, newUser);
    }
    async findMany() {
        const posts = await this.prisma.user.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return (0, class_transformer_1.plainToInstance)(respone_user_dto_1.ResponeUserDto, posts);
    }
    async findByTitle(title) {
        const findID = await this.prisma.user.findFirst({
            where: { title }
        });
        return (0, class_transformer_1.plainToInstance)(respone_user_dto_1.ResponeUserDto, findID);
    }
    async updateTitle(title, updateUserDto) {
        const userInfo = await this.prisma.user.findFirst({
            where: { title }
        });
        if (!userInfo) {
            throw new common_1.NotFoundException(`Không tìm thấy bài viết với tiêu đề: ${title}`);
        }
        const updatePost = await this.prisma.user.update({
            where: { title: userInfo.title },
            data: {
                ...updateUserDto
            }
        });
        return (0, class_transformer_1.plainToInstance)(respone_user_dto_1.ResponeUserDto, updatePost);
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map