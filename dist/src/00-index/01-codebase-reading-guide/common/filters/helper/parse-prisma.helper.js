"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsedPrismaError = ParsedPrismaError;
const error_code_constant_1 = require("../constants/error-code.constant");
const common_1 = require("@nestjs/common");
function ParsedPrismaError(exception) {
    switch (exception.code) {
        case error_code_constant_1.PRISMA_ERROR_CODE.UNIQUE_VIOLATION:
            return {
                statusCode: common_1.HttpStatus.CONFLICT,
                errorType: error_code_constant_1.ERROR_TYPE.DB_DUPLICATE,
                message: `Dữ liệu đã tồn tại (vi phạm unique tại: ${exception.meta?.target ?? 'không rõ'})`,
            };
        case error_code_constant_1.PRISMA_ERROR_CODE.RECORD_NOT_FOUND:
            return {
                statusCode: common_1.HttpStatus.NOT_FOUND,
                errorType: error_code_constant_1.ERROR_TYPE.DB_NOT_FOUND,
                message: 'Bản ghi không tồn tại hoặc đã bị xóa',
            };
        case error_code_constant_1.PRISMA_ERROR_CODE.FOREIGN_KEY_VIOLATION:
            return {
                statusCode: common_1.HttpStatus.NOT_FOUND,
                errorType: error_code_constant_1.ERROR_TYPE.DB_FOREIGN_KEY,
                message: 'Vướng dữ liệu liên quan (khóa ngoại)',
            };
        default:
            return {
                statusCode: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                errorType: `${error_code_constant_1.ERROR_TYPE.INTERNAL}_Prisma_${exception.code}`,
                message: `Lỗi truy vấn Prisma mã ${exception.code}: ${exception.message}`,
            };
    }
}
//# sourceMappingURL=parse-prisma.helper.js.map