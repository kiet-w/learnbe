import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): string;
    triggerBad(): void;
    triggerCrash(): any;
    getDashboard(req: any): {
        message: string;
        user: any;
    };
}
