import { Module, forwardRef } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthService } from './modules/auth/auth.service';
import { ConfigModule } from '@nestjs/config';

@Module({ 
  imports: [ConfigModule.forRoot(),UsersModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, AuthService,],
})
export class AppModule {}
