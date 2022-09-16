import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './user.model';
import { LocalStrategy } from 'src/middleware/passport';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from 'src/config/config.module';
import { ConfigService } from 'src/config/config.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { NodeMailer } from 'src/middleware/NodeMailer';
import { MessageBirdService } from 'src/middleware/sms';
import { UserCredentialsDto } from './dto/user-credentials.dto';
import { GoogleStrategy } from 'src/modules/auth/strategies/gmailSignUpStrategy';
@Module({
imports: [ConfigModule,
    MongooseModule.forRoot("mongodb://localhost:27017/test"),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    PassportModule.register({ defaultStrategy: 'jwt', session: true }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secretOrPrivateKey: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: '10s',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    LocalStrategy,
    UsersService,
    GoogleStrategy,
    AuthCredentialsDto,
    NodeMailer,
    MessageBirdService,
    UserCredentialsDto,
    {
      provide: 'MessageBirdClient',
      useFactory: async () => {
        return import('messagebird').then((messagebird: any) => {
          const client = messagebird('HCdjDOZtS6a5NaJ6nwsrM7HuW');
          return client;
        });
      },
    },
  ],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
