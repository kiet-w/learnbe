"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainException = exports.BusinessException = void 0;
const common_1 = require("@nestjs/common");
class BusinessException extends common_1.HttpException {
    errorCode;
    constructor(errorCode, message, statusCode = common_1.HttpStatus.UNPROCESSABLE_ENTITY) {
        super({
            errorCode,
            message,
            statusCode,
        }, statusCode);
        this.errorCode = errorCode;
    }
}
exports.BusinessException = BusinessException;
class DomainException extends common_1.HttpException {
    constructor(message) {
        super({
            errorCode: 'DOMAIN_VIOLATION',
            message,
            statusCode: common_1.HttpStatus.BAD_REQUEST,
        }, common_1.HttpStatus.BAD_REQUEST);
    }
}
exports.DomainException = DomainException;
//# sourceMappingURL=business.exception.js.map