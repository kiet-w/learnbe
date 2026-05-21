"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.success = success;
exports.paginated = paginated;
function success(data) {
    return {
        success: true,
        data,
    };
}
function paginated(data, total, page, limit) {
    return {
        success: true,
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