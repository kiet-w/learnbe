"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AllExceptionsFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const helper_1 = require("./helper");
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    logger;
    constructor() {
        this.logger = new common_1.Logger(AllExceptionsFilter_1.name);
    }
    catch(exception, host) {
        const contextType = host.getType();
        if (contextType !== 'http') {
            this.logger.error?.(`Exception in ${contextType} context`, (0, helper_1.extractStackTrace)(exception));
            return;
        }
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();
        const resolved = (0, helper_1.resolvePrismaException)(exception)
            || (0, helper_1.resolveHttpException)(exception)
            || (0, helper_1.resolveGenericException)(exception);
        const { statusCode, errorType, message } = resolved;
        const exactLocation = (0, helper_1.extractStackTrace)(exception);
        this.logError(exception, request, statusCode, errorType, exactLocation);
        const body = {
            statusCode,
            errorType,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
            devLocation: process.env.NODE_ENV !== 'production' ? exactLocation : undefined,
        };
        if (!response.headersSent) {
            response.status(statusCode).json(body);
        }
    }
    logError(exception, request, statusCode, errorType, exactLocation) {
        if (statusCode >= common_1.HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error?.(`[${request.method}] ${request.url} | STATUS: ${statusCode} | TYPE: ${errorType}`, JSON.stringify({
                errorType,
                clientIp: request.ip,
                body: (0, helper_1.sanitizeBody)(request.body),
                query: request.query,
                params: request.params,
                exactLocation,
            }, null, 2));
        }
        else {
            this.logger.warn?.(`[${request.method}] ${request.url} | STATUS: ${statusCode} | MSG: ${exception?.message}`);
        }
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [])
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map