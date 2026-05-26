import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminOrdersService } from './admin-orders.service';
import { AdminOrdersRepository } from './admin-orders.repository';

@Module({
  imports: [AuthModule],
  controllers: [AdminOrdersController],
  providers: [AdminOrdersService, AdminOrdersRepository, RolesGuard],
})
export class AdminOrdersModule {}
