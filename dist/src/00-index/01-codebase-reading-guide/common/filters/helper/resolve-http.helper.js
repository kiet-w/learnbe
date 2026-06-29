"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveHttpException = resolveHttpException;
const common_1 = require("@nestjs/common");
const error_code_constant_1 = require("../constants/error-code.constant");
function resolveHttpException(exception) {
    if (exception instanceof SyntaxError && 'status' in exception && exception.status === 400) {
        return {
            statusCode: common_1.HttpStatus.BAD_REQUEST,
            errorType: error_code_constant_1.ERROR_TYPE.VALIDATION,
            message: 'Dữ liệu JSON gửi lên không hợp lệ (Syntax Error)',
        };
    }
    if (exception instanceof common_1.HttpException) {
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
    return null;
}
//# sourceMappingURL=resolve-http.helper.js.map