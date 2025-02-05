import { IsEmail, Length } from 'class-validator';

export class CreateUserInputDto {
  @Length(3, 10)
  login: string;
  @Length(6, 20)
  password: string;
  @IsEmail()
  email: string;
}
