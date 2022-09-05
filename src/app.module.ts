import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { EmailController } from './email/email.controller';
@Module({
  imports: [
    
    UsersModule,
  ],
  controllers: [AppController, ],
  providers: [AppService],
})
export class AppModule {}
