import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { UsersService } from 'src/modules/users/users.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService,],
  imports: [UsersModule],
})
export class AuthModule {}
