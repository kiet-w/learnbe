"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.success = success;
exports.paginated = paginated;
function success(data, message = 'Thành công', statusCode = 200) {
    return {
        statusCode,
        message,
        data,
    };
}
function paginated(data, total, page, limit, message = 'Thành công', statusCode = 200) {
    return {
        statusCode,
        message,
        data,
        meta: {
            total,
            page,
            limit,
            totalPages: total === 0 ? 0 : Math.ceil(total / limit),
        },
    };
}
//# sourceMappingURL=api-response.util.js.map