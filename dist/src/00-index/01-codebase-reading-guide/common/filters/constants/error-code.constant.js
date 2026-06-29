"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRISMA_ERROR_CODE = exports.ERROR_TYPE = void 0;
exports.ERROR_TYPE = {
    VALIDATION: 'Lỗi_Đầu_Vào_DTO',
    UNAUTHORIZED: 'Lỗi_Chưa_Đăng_Nhập',
    FORBIDDEN: 'Lỗi_Không_Đủ_Quyền',
    NOT_FOUND: 'Lỗi_Không_Tìm_Thấy',
    DB_DUPLICATE: 'Lỗi_Database_Trùng_Lặp',
    DB_NOT_FOUND: 'Lỗi_Database_Không_Tìm_Thấy',
    DB_FOREIGN_KEY: 'Lỗi_Database_Khóa_Ngoại',
    INTERNAL: 'Lỗi_Hệ_Thống_Nội_Bộ',
};
exports.PRISMA_ERROR_CODE = {
    UNIQUE_VIOLATION: 'P2002',
    RECORD_NOT_FOUND: 'P2025',
    FOREIGN_KEY_VIOLATION: 'P2003',
};
//# sourceMappingURL=error-code.constant.js.map