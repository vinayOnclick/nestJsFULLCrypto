import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserCredentialsDto {

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  address: string;

  @IsString()
  secret: string;
  @IsString()
  token: string;

  @IsNumber()
  emailOtpCode: number;

  @IsNumber()
  mobileOtpCode: number;
   
  @IsString()
  phoneNumber: string;
  @IsString()
  userName: string;
  @IsBoolean()
  status: boolean;
  @IsString()
  activeEmailStatus: string;
  @IsString()
  activeMobileStatus: string;
  @IsString()
  email2faStatus: string
  @IsString()
  google2faStatus: string;
  @IsString()
  mobile2faStatus: string;
}
