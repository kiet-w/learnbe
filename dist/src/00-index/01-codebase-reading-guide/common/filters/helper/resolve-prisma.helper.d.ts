import { HttpStatus } from '@nestjs/common';
export declare function resolvePrismaException(exception: unknown): {
    statusCode: HttpStatus;
    errorType: string;
    message: string;
} | null;
