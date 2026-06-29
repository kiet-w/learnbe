import { HttpStatus } from '@nestjs/common';
export declare function resolveGenericException(exception: unknown): {
    statusCode: HttpStatus;
    errorType: "Lỗi_Hệ_Thống_Nội_Bộ";
    message: string;
};
