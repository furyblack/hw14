import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/user.entity';
import { UsersController } from './api/users.controller';
import { UsersService } from './application/users.service';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { UsersRepository } from './infrastructure/users.repository';
import { JwtStrategy } from './guards/bearer/jwt.strategy';
import { SecurityDevicesQueryRepository } from './infrastructure/query/security-devices.query-repository';
import { AuthQueryRepository } from './infrastructure/query/auth.query-repository';
import { AuthService } from './application/auth.service';
import { LocalStrategy } from './guards/local/local.strategy';
import { CryptoService } from './application/crypto.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    SecurityDevicesQueryRepository,
    AuthQueryRepository,
    //LoginIsExistConstraint,
    AuthService,
    LocalStrategy,
    CryptoService,
    JwtStrategy,
  ],
  exports: [
    UsersRepository,
    MongooseModule,
    JwtStrategy,
    /* MongooseModule реэкспорт делаем, если хотим чтобы зарегистрированные здесь модельки могли
    инджектиться в сервисы других модулей, которые импортнут этот модуль */
  ],
})
export class UserAccountsModule {}
