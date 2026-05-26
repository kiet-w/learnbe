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
exports.AdminCategoriesRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AdminCategoriesRepository = class AdminCategoriesRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createCategory(data) {
        return this.prisma.category.create({
            data,
        });
    }
    async updateCategory(id, data) {
        return this.prisma.category.update({
            where: { id },
            data,
        });
    }
    async findCategoryById(id) {
        return this.prisma.category.findUnique({
            where: { id },
        });
    }
    async findCategoryBySlug(slug) {
        return this.prisma.category.findUnique({
            where: { slug },
        });
    }
    async ensureCategoryExists(id) {
        const category = await this.findCategoryById(id);
        if (!category) {
            throw new common_1.NotFoundException('Danh mục không tồn tại');
        }
        return category;
    }
    async ensureUniqueCategorySlug(slug, excludeId) {
        const existing = await this.findCategoryBySlug(slug);
        if (existing && existing.id !== excludeId) {
            throw new common_1.ConflictException('Slug danh mục đã tồn tại');
        }
    }
};
exports.AdminCategoriesRepository = AdminCategoriesRepository;
exports.AdminCategoriesRepository = AdminCategoriesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminCategoriesRepository);
//# sourceMappingURL=admin-categories.repository.js.map