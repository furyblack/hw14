import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../domain/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import bcrypt from 'bcrypt';
import { UsersRepository } from '../infrastructure/users.repository';
import { Types } from 'mongoose';
import { EmailService } from '../../notifications/email.service';
import { CryptoService } from './crypto.service';

@Injectable()
export class UsersService {
  constructor(
    //инжектирование модели в сервис через DI
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private usersRepository: UsersRepository,
    private emailService: EmailService,
    private cryptoService: CryptoService,
  ) {}
  async createUser(dto: CreateUserDto): Promise<string> {
    //TODO: move to brypt service
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.UserModel.createInstance({
      email: dto.email,
      login: dto.login,
      passwordHash: passwordHash,
    });

    await this.usersRepository.save(user);

    return user._id.toString();
  }

  // async updateUser(id: string, dto: UpdateUserDto): Promise<string> {
  //   const user = await this.usersRepository.findOrNotFoundFail(id);
  //
  //   user.update(dto);
  //
  //   await this.usersRepository.save(user);
  //
  //   return user._id.toString();
  // }

  async deleteUser(id: string) {
    const user = await this.usersRepository.findOrNotFoundFail(
      new Types.ObjectId(id),
    );

    user.makeDeleted();

    await this.usersRepository.save(user);
  }
  async registerUser(dto: CreateUserDto) {
    const createdUserId = await this.createUser(dto);

    const confirmCode = 'uuid';

    const user = await this.usersRepository.findOrNotFoundFail(
      new Types.ObjectId(createdUserId),
    );

    user.setConfirmationCode(confirmCode);
    await this.usersRepository.save(user);

    this.emailService
      .sendConfirmationEmail(user.email, confirmCode)
      .catch(console.error);
  }
}
