"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeBody = void 0;
const sanitizeBody = (body) => {
    if (!body)
        return body;
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'accessToken', 'refreshToken', 'token', 'secret'];
    sensitiveFields.forEach((field) => {
        if (sanitized[field]) {
            sanitized[field] = '***';
        }
    });
    return sanitized;
};
exports.sanitizeBody = sanitizeBody;
//# sourceMappingURL=sanitize-body.helper.js.map