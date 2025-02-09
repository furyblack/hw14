import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { JwtService } from '@nestjs/jwt';
import { CryptoService } from './crypto.service';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { UsersService } from './users.service';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
    private cryptoService: CryptoService,
    readonly usersService: UsersService,
  ) {}

  async validateUser(
    login: string,
    password: string,
  ): Promise<UserContextDto | null> {
    const user = await this.usersRepository.findByLogin(login);
    if (!user) {
      return null;
    }

    const isPasswordValid = await this.cryptoService.comparePasswords({
      password,
      hash: user.passwordHash,
    });

    if (!isPasswordValid) {
      return null;
    }

    return { id: user.id.toString() };
  }

  async login(userId: string) {
    const accessToken = this.jwtService.sign({ id: userId } as UserContextDto);

    return {
      accessToken,
    };
  }
  async register(dto: CreateUserDto) {
    const loginExists = await this.usersService.isLoginTaken(dto.login);
    if (loginExists) {
      throw new BadRequestException('Login already exists');
    }

    return this.usersService.createUser(dto);
  }
  async confirmRegistration(code: string): Promise<void> {
    const user = await this.usersRepository.findByConfirmationCode(code);

    if (!user) {
      throw new BadRequestException({
        errorsMessages: [
          { message: 'Invalid confirmation code', field: 'code' },
        ],
      });
    }

    if (user.isEmailConfirmed) {
      throw new BadRequestException({
        errorsMessages: [{ message: 'User already confirmed', field: 'code' }],
      });
    }

    if (
      user.confirmationCodeExpiration &&
      user.confirmationCodeExpiration < new Date()
    ) {
      throw new BadRequestException({
        errorsMessages: [
          { message: 'Confirmation code expired', field: 'code' },
        ],
      });
    }

    user.isEmailConfirmed = true;
    user.confirmationCode = null; // Теперь это допустимо, так как confirmationCode может быть строкой или null
    user.confirmationCodeExpiration = null; // То же самое для confirmationCodeExpiration

    await user.save();
  }
}
