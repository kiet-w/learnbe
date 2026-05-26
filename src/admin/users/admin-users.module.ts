import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';
import { AdminUsersRepository } from './admin-users.repository';

@Module({
  imports: [AuthModule],
  controllers: [AdminUsersController],
  providers: [AdminUsersService, AdminUsersRepository, RolesGuard],
  exports: [AdminUsersService],
})
export class AdminUsersModule {}
