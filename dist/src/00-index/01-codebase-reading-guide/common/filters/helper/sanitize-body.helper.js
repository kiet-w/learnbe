"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeBody = void 0;
const SENSITIVE_FIELDS = [
    'password', 'accessToken', 'refreshToken',
    'token', 'secret', 'authorization',
    'creditCard', 'cvv', 'ssn',
];
const MAX_BODY_LOG_SIZE = 4096;
const sanitizeBody = (body) => {
    if (!body)
        return body;
    const sanitized = sanitizeDeep(body);
    const serialized = JSON.stringify(sanitized);
    if (serialized.length > MAX_BODY_LOG_SIZE) {
        return {
            _truncated: true,
            _originalSize: `${serialized.length} bytes`,
            _preview: serialized.slice(0, MAX_BODY_LOG_SIZE) + '...',
        };
    }
    return sanitized;
};
exports.sanitizeBody = sanitizeBody;
function sanitizeDeep(value, depth = 0) {
    if (depth > 10)
        return '[nested too deep]';
    if (value === null || value === undefined || typeof value !== 'object') {
        return value;
    }
    if (Array.isArray(value)) {
        return value.map((item) => sanitizeDeep(item, depth + 1));
    }
    const sanitized = {};
    for (const key of Object.keys(value)) {
        if (SENSITIVE_FIELDS.includes(key.toLowerCase())) {
            sanitized[key] = '***';
        }
        else {
            sanitized[key] = sanitizeDeep(value[key], depth + 1);
        }
    }
    return sanitized;
}
//# sourceMappingURL=sanitize-body.helper.js.map