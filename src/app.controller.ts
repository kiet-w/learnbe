import {
  Controller,
  Get,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './auth/auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Tình huống 1: Lỗi khách hàng (400)
  @Get('bad-request')
  triggerBad() {
    throw new BadRequestException('Form đăng ký của bạn bị sai định dạng rồi!');
  }

  // Tình huống 2: Lỗi hệ thống (500)
  @Get('server-crash')
  triggerCrash() {
    const database: any = null;
    return database.user.findMany();
  }

  @Get('dashboard')
  @UseGuards(AuthGuard)
  getDashboard(@Req() req: any) {
    return {
      message: 'Chào mừng bạn đến với trang quản trị!',
      user: req.user,
    };
  }
}
