import { HttpException } from '@nestjs/common';
export declare class BusinessException extends HttpException {
    readonly errorCode: string;
    constructor(errorCode: string, message: string, statusCode?: number);
}
export declare class DomainException extends HttpException {
    constructor(message: string);
}
