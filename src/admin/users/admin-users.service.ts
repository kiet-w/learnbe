import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { AdminUsersRepository } from './admin-users.repository';

@Injectable()
export class AdminUsersService {
  private readonly logger = new Logger(AdminUsersService.name);

  constructor(private readonly repository: AdminUsersRepository) {}

  async findUsers() {
    return this.repository.findAllUsers();
  }

  async toggleUserLock(adminId: number, userId: number, isActive: boolean) {
    if (adminId === userId) {
      throw new ConflictException(
        'Bạn không thể tự khóa tài khoản của chính mình',
      );
    }

    const user = await this.repository.updateUser(userId, { isActive });
    this.logger.log(
      `Admin ${adminId} updated user ${userId} isActive to ${isActive}`,
    );
    return user;
  }
}
