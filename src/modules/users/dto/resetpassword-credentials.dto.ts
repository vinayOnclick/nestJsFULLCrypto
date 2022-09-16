import { IsString, IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordCredentialsDto {
  @IsString()
  @IsEmail()
  @ApiProperty()
  email: string;
  @IsString()
  @ApiProperty()
  password: string;
  @IsString()
  @ApiProperty()
  confirmPassword: string;
  @IsString()
  @ApiProperty()
  code: string;
}
