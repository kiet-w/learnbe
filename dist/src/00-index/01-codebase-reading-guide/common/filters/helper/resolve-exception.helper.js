"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveException = resolveException;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const error_code_constant_1 = require("../constants/error-code.constant");
const parse_prisma_helper_1 = require("./parse-prisma.helper");
function resolveException(exception) {
    if (exception instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        return (0, parse_prisma_helper_1.ParsedPrismaError)(exception);
    }
    if (exception instanceof client_1.Prisma.PrismaClientValidationError) {
        return {
            statusCode: common_1.HttpStatus.BAD_REQUEST,
            errorType: error_code_constant_1.ERROR_TYPE.VALIDATION,
            message: 'Truy vấn gửi xuống Database sai cú pháp hoặc thiếu tham số',
        };
    }
    if (exception instanceof common_1.HttpException) {
        return resolveHttpException(exception);
    }
    if (exception instanceof SyntaxError && 'status' in exception && exception.status === 400) {
        return {
            statusCode: common_1.HttpStatus.BAD_REQUEST,
            errorType: error_code_constant_1.ERROR_TYPE.VALIDATION,
            message: 'Dữ liệu JSON gửi lên không hợp lệ (Syntax Error)',
        };
    }
    if (exception instanceof Error) {
        return {
            statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            errorType: error_code_constant_1.ERROR_TYPE.INTERNAL,
            message: `Lỗi hệ thống: ${process.env.NODE_ENV !== 'production' ? exception.message : 'Đã có lỗi xảy ra'}`,
        };
    }
    return {
        statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
        errorType: error_code_constant_1.ERROR_TYPE.INTERNAL,
        message: 'Lỗi không xác định',
    };
}
function resolveHttpException(exception) {
    const statusCode = exception.getStatus();
    const res = exception.getResponse();
    let message = res?.message ?? exception.message;
    if (Array.isArray(message)) {
        message = message.join(', ');
    }
    const errorCode = res?.errorCode;
    const errorTypeMap = {
        [common_1.HttpStatus.BAD_REQUEST]: error_code_constant_1.ERROR_TYPE.VALIDATION,
        [common_1.HttpStatus.UNAUTHORIZED]: error_code_constant_1.ERROR_TYPE.UNAUTHORIZED,
        [common_1.HttpStatus.FORBIDDEN]: error_code_constant_1.ERROR_TYPE.FORBIDDEN,
        [common_1.HttpStatus.NOT_FOUND]: error_code_constant_1.ERROR_TYPE.NOT_FOUND,
        [common_1.HttpStatus.CONFLICT]: 'CONFLICT_ERROR',
        [common_1.HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMIT_ERROR',
    };
    return {
        statusCode,
        errorType: errorCode ?? errorTypeMap[statusCode] ?? 'Lỗi_Logic_Nghiệp_Vụ',
        message,
    };
}
//# sourceMappingURL=resolve-exception.helper.js.map