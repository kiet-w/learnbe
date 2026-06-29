"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveGenericException = resolveGenericException;
const common_1 = require("@nestjs/common");
const error_code_constant_1 = require("../constants/error-code.constant");
function resolveGenericException(exception) {
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
//# sourceMappingURL=resolve-generic.helper.js.map