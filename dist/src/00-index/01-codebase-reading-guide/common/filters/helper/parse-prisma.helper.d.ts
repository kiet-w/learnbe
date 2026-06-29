import { Prisma } from "@prisma/client";
export interface ParsedPrismaError {
    statusCode: number;
    errorType: string;
    message: string;
}
export declare function ParsedPrismaError(exception: Prisma.PrismaClientKnownRequestError): ParsedPrismaError;
