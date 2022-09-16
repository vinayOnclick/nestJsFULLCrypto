import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { User } from 'src/modules/users/user.model';
import RefreshToken from './entities/refresh-token.entity';
import { sign, verify } from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';
@Injectable()
export class AuthService {
  private refreshTokens: RefreshToken[] = [];
  private jwtService :JwtService

  constructor(private readonly userService: UsersService) {}
  async verifyToken(token: string): Promise<boolean> {
    const user = await this.jwtService.verify(token);
    return user;
  }
  
 public async generateTwoFactorAuthenticationSecret(
 
  ) {
    const secret = authenticator.generateSecret();
    const qrUrl= qrcode.toDataURL(secret,(err,data)=>{
      console.log(data);
    })
    

    console.log(secret);
  }

  
}
