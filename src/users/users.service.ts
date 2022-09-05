import {
  BadRequestException,
  UnauthorizedException,
  Injectable,
  Request,
  Response,
  Param,
  Body,
} from '@nestjs/common';
import { NodeMailer } from 'src/middleware/NodeMailer';
import configVinay from 'src/config/configVinay';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.model';
let ObjectId = require('mongodb').ObjectId;
import { UserCredentialsDto } from './dto/user-credentials.dto';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtPayload } from '../middleware/jwt-payload.interface';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MessageBirdService } from 'src/middleware/sms';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private usersModel: Model<User>,
    private jwtTokenService: JwtService,
    public NodeMailer: NodeMailer,
    private MessageBirdService: MessageBirdService,
    private user: UserCredentialsDto,
  ) {}

  async findOneByEmail(email: string): Promise<User> {
    return await this.usersModel.findOne({ email: email });
  }
  async findOneByPhone(phone: string): Promise<User> {
    return await this.usersModel.findOne({ phoneNumber: phone });
  }

  async validateUserByJwt(payload: JwtPayload) {
    let user = await this.findOneByPhone(payload.phoneNumber);
    if (user) {
      return user;
    } else {
      throw new UnauthorizedException();
    }
  }
  async encryptPassword(password: string): Promise<any> {
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          reject(err);
        } else {
          resolve(hash);
        }
      });
    });
  }

  async emailVerify(
    userCred: UserCredentialsDto,
    @Response() res: any,
  ): Promise<any> {
    const user: any = await this.usersModel.findOne({ userCred });
    console.log(userCred);
    if (user) {
      let matching = userCred.emailOtpCode == user.emailOtpCode;
      console.log(matching, 'match');
      console.log(user.emailOtpCode, 'otp');
      console.log(userCred.emailOtpCode, 'body');

      if (matching) {
        const update = await this.usersModel.updateOne({
          activeEmailStatus: 'Active',
        });
        const updateStatus = {
          status: 200,
          message: 'success',
          data: update,
        };
        return { update, updateStatus };
      } else {
        return new BadRequestException('Invalid Token');
      }
    } else {
      return new BadRequestException('user Not found');
    }
  }

  async phoneVerify(
    userCred: UserCredentialsDto,
    @Response() res: any,
  ): Promise<any> {
    const user: any = await this.usersModel.findOne({ userCred });
    console.log(userCred);
    console.log(user.mobileOtpCode, 'otp');

    if (user) {
      let matching = userCred.mobileOtpCode == user.mobileOtpCode;
      console.log(matching, 'match');
      console.log(user.mobileOtpCode, 'otp');
      console.log(userCred.mobileOtpCode, 'body');

      if (matching) {
        const update = await this.usersModel.updateOne({
          activeMobileStatus: 'Active',
        });
        const updateStatus = {
          status: 200,
          message: 'success',
          data: update,
        };
        return { update, updateStatus };
      } else {
        return new BadRequestException('Invalid Token');
      }
    } else {
      return new BadRequestException('user Not found');
    }
  }

  async register(userCred: UserCredentialsDto, @Response() res: any) {
    let usersCount = (await this.usersModel.estimatedDocumentCount()) + 1;
    let today = new Date().toISOString().substr(0, 10);
    let todayDate = today.replace(/-/g, '');
    let userId = todayDate + usersCount;
    var digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 6; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }

    let MOBOTP = '';
    for (let i = 0; i < 4; i++) {
      MOBOTP += digits[Math.floor(Math.random() * 10)];
    }

    try {
      const exist = await this.findOneByEmail(userCred.email);
      if (!exist) {
        const data = await new this.usersModel({
          userId: userId,
          fullName: userCred.fullName,
          email: userCred.email,
          password: userCred.password,
          phoneNumber: userCred.phoneNumber,
          address: userCred.address,
          emailOtpCode: OTP,
          mobileOtpCode: MOBOTP,
        });
        const save = await data.save();
        const sent = await NodeMailer.sendEmail({
          from: configVinay.USER,
          to: userCred.email,
          subject: 'Its a SMTP message from vinay Sharma',
          html: `Hello ,Please use this OTP ${OTP} to verify your account `,
        });
        const sms = await this.MessageBirdService.sendMessage({
          recipient: userCred.phoneNumber,
          message: 'This is a test message',
        });
        return { sent, sms, save };
      } else {
        return new BadRequestException(
          'User Already Exists With The Email You Provided',
        );
      }
    } catch (error) {
      return error;
    }
  }

  async login(userCred: AuthCredentialsDto, request: any): Promise<any> {
    const user = await this.usersModel.findOne({ userCred });
    if (!user) {
      return new BadRequestException('email or phoneNumber is not existed');
    } else {
      console.log(user);
      let result = await bcrypt.compare(userCred.password, user.password);
      if (!result) {
        console.log('password not matching');
        return new BadRequestException('password matching fail');
      } else {
        const accesstoken = await this.jwtTokenService.sign({
          user,
          JWT_SECRET: 'u$Er2o20bYeCc0me',
        });
        return { user, accesstoken };
      }
    }
  }
  async Googl2faStatus(
    @Param() id: string,

    @Body() dto: UserCredentialsDto,
    @Request() request: any,
  ): Promise<any> {
    const user: any = await this.usersModel.findOne({ id });

    try {
      if (!user) {
        return new BadRequestException('user not  existed');
      } else {
        const enable: any = await this.usersModel.updateOne(
          { user },
          { ...dto },
        );

        return { enable };
      }
    } catch (error) {
      return new BadRequestException();
    }
  }
  async Mobile2faStatus(
    @Param() id: string,

    @Body() dto: UserCredentialsDto,
    @Request() request: any,
  ): Promise<any> {
    const user: any = await this.usersModel.findOne({ id });

    try {
      if (!user) {
        return new BadRequestException('user not  existed');
      } else {
        const enable: any = await this.usersModel.updateOne(
          { user },
          { ...dto },
        );

        return { enable };
      }
    } catch (error) {
      return new BadRequestException();
    }
  }
  async email2faStatus(
    @Param() id: string,

    @Body() dto: UserCredentialsDto,
    @Request() request: any,
  ): Promise<any> {
    const user: any = await this.usersModel.findOne({ id });

    try {
      if (!user) {
        return new BadRequestException('user not  existed');
      } else {
        const enable: any = await this.usersModel.updateOne(
          { user },
          { ...dto },
        );

        return { enable };
      }
    } catch (error) {
      return new BadRequestException();
    }
  }
  async updateUser(
    @Param() id: string,

    @Body() dto: UserCredentialsDto,
    @Request() request: any,
  ): Promise<any> {
    
    const user: any = await this.usersModel.findOne({ id });

    try {
      if (!user) {
        return new BadRequestException('user not  existed');
      } else {
        const enable: any = await this.usersModel.updateOne(
          { user },
          { ...dto },
        );

        return { enable };
      }
    } catch (error) {
      return new BadRequestException();
    }
  }
}
