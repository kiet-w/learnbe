"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const all_exception_filters_1 = require("./00-index/01-codebase-reading-guide/common/filters/all-exception.filters");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalFilters(new all_exception_filters_1.AllExceptionFilter());
    await app.listen(process.env.PORT ?? 4000);
}
void bootstrap();
//# sourceMappingURL=main.js.map