import { INestApplication } from '@nestjs/common';
import { CreateUserDto } from '../../src/moduls/user-accounts/dto/create-user.dto';
import { UsersTestManager } from './users-test-manager';

export class AuthTestManager {
  constructor(
    private app: INestApplication,
    private readonly userTestManager: UsersTestManager,
  ) {}
  async registrationUser(dto: CreateUserDto): Promise<void> {
    const createdUserId = await this.userTestManager.createUser(dto);
    const confirmCode = 'uuid';

    const user = await this.userTestManager.findUserById(createdUserId);
    user.setConfirmationCode(confirmCode);
    await this.usersRepository.save(user);

    this.emailService
      .sendConfirmationEmail(user.email, confirmCode)
      .catch(console.error);
  }
}
