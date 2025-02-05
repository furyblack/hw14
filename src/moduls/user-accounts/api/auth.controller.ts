import { UsersService } from '../application/users.service';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { AuthQueryRepository } from '../infrastructure/query/auth.query-repository';
import { CreateUserInputDto } from './input-dto/users.input-dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth.guard';
import { ExtractUserFromRequest } from '../guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { MeViewDto } from './view-dto/users.view-dto';

@Controller('auth')
export class AuthController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private authQueryRepository: AuthQueryRepository,
  ) {}

  @Post('registration')
  registration(@Body() body: CreateUserInputDto): Promise<void> {
    return this.usersService.registerUser(body);
  }

  @ApiBearerAuth()
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@ExtractUserFromRequest() user: UserContextDto): Promise<MeViewDto> {
    return this.authQueryRepository.me(user.id);
  }
}
