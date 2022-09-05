import { IsString, IsEmail, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthCredentialsDto {
  @IsString()
  @IsEmail()
  email: string;
  @IsString()
  @IsEmail()
  phoneNumber: string;
  @IsString()
  @IsNotEmpty()
  password: string;
  @IsNumber()
  otp: number;
}
