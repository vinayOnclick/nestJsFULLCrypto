import {
  BadRequestException,
  UnauthorizedException,
  Injectable,
  Req,
  Response,
  Res,
  Param,
  Body,
} from '@nestjs/common';
import { NodeMailer } from 'src/middleware/NodeMailer';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.model';
let ObjectId = require('mongodb').ObjectId;
import { UserCredentialsDto } from './dto/user-credentials.dto';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtPayload } from '../../middleware/jwt-payload.interface';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MessageBirdService } from 'src/middleware/sms';
import * as Speakeasy from 'speakeasy';

@Injectable()
export class UsersService {
  user: any;
  constructor(
    @InjectModel('User') private usersModel: Model<User>,
    private jwtTokenService: JwtService,
    public NodeMailer: NodeMailer,
    private MessageBirdService: MessageBirdService,
    private UserCredentialsDto: UserCredentialsDto,
  ) {}
  ////middleWares for login and SignUp
  async findOneByEmail(email: string): Promise<User> {
    return await this.usersModel.findOne({ email: email });
  }
  async findOneByPhone(phone: string): Promise<User> {
    return await this.usersModel.findOne({ phoneNumber: phone });
  }
  async findOneId(id: string) {
    return await this.usersModel.findById(id);
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
  async secretKey() {
    try {
      const getsecret = Speakeasy.generateSecret({ length: 20 });
      return getsecret.base32;
    } catch (error) {
      return error;
    }
  }

  async generateEmail2faToken(
    @Body() userDto: UserCredentialsDto,
    @Param() id: string,
  ) {
    try {
      var token: any = await Speakeasy.totp(
        {
          secret: userDto.emailToken,
          encoding: 'base32',
        },
        { remaining: 30 - Math.floor((new Date().getTime() / 1000.0) % 30) },
      );

      const updateToken = await this.usersModel.updateOne(
        { id },
        { $set: { token: token } },
      );

      console.log(updateToken);
      return { token, updateToken };
    } catch (error) {
      return error;
    }
  }
  async generateMobile2faToken(
    @Body() userDto: UserCredentialsDto,
    @Param() id: string,
  ) {
    try {
      var token: any = await Speakeasy.totp(
        {
          secret: userDto.mobileToken,
          encoding: 'base32',
        },
        { remaining: 30 - Math.floor((new Date().getTime() / 1000.0) % 30) },
      );

      const updateToken = await this.usersModel.updateOne(
        { id },
        { $set: { token: token } },
      );

      console.log(updateToken);
      return { token, updateToken };
    } catch (error) {
      return error;
    }
  }
  async validateEmail2fa(
    @Body() userDto: UserCredentialsDto,
    @Param() id: string,
  ) {
    var user: any = await this.usersModel.findOne({ id });
    var { emailToken, secret } = userDto;
    var token = Speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      emailToken,
      window: 1, //timeWindow
    });
    console.log(token);

    return { token };
  }
  async validateMobile2fa(
    @Body() userDto: UserCredentialsDto,
    @Param() id: string,
  ) {
    var user: any = await this.usersModel.findOne({ id });
    var { mobileToken, secret } = userDto;
    var token = Speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      mobileToken,
      window: 1, //timeWindow
    });
    console.log(token);

    return { token };
  }

  ///email verification api
  async emailVerify(
    userCred: UserCredentialsDto,
    @Res() res: any,
    @Req() req: any,
  ): Promise<any> {
    try {
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
          return await res.send({
            status: 'Success',
            message: 'email Verified',
            code: 200,
            data: update,
            error: null,
          });
        } else {
          return await res.send({
            status: 'error',
            message: 'Invalid Token',
            code: 402,
            data: null,
          });
        }
      } else {
        return await res.send({
          status: 200,
          message: 'User Not Found',
          data: undefined,
        });
      }
    } catch (error) {
      return error;
    }
  }
  ///Phone verifiaction Api using token
  async phoneVerify(
    userCred: UserCredentialsDto,
    @Res() res: any,
    @Req() req: any,
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
        return await res.send({
          status: 200,
          message: 'SuccessFully Updated',
          data: update,
        });
      } else {
        return await res.send({
          status: 401,
          message: 'Invalid Token',
          data: null,
        });
      }
    } else {
      return await res.send({
        status: 401,
        message: 'User Not found',
        data: null,
      });
    }
  }
  /////Api for registering User
  async register(
    @Body() userCred: UserCredentialsDto,
    @Req() request: any,
    @Res() response: any,
  ) {
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
          from: process.env.API_USER,
          to: userCred.email,
          subject: 'Its a SMTP message from vinay Sharma',
          html: `Hello ,Please use this OTP ${OTP} to verify your account `,
        });
        const sms = await this.MessageBirdService.sendMessage({
          recipient: userCred.phoneNumber,
          message: 'This is a test message',
        });
        await response.send({
          status: 200,
          message: 'User SuccessFully Registerd',
          data: data,
        });
        return { save, sent, sms };
      } else {
        return await response.send({
          status: 402,
          message: 'User Already Exists With The Email You Provided',
          data: null,
        });
      }
    } catch (error) {
      return error;
    }
  }
  /////Api for User Login

  async login(
    userCred: AuthCredentialsDto,
    @Req() request: any,
    @Res() response: any,
  ): Promise<any> {
    try {
      let user: any = await this.findOneByEmail(userCred.email);
      console.log(user);

      if (!user) {
        return response.send({
          status: 401,
          message: 'User Not Found',
          data: null,
        });
      } else {
        let result = await bcrypt.compare(userCred.password, user.password);
        if (!result) {
          return response.send({
            status: 401,
            message: 'password not matching',
            data: null,
          });
        }
        if (user.email2faStatus === 'Active') {
          const sent = await NodeMailer.sendEmail({
            from: process.env.API_USER,
            to: userCred.email,
            subject: 'Its a SMTP message from BOTS',
            html: `Hello ,Please use this OTP  to Complete Your Login `,
          });
          console.log(userCred.email);
        } else {
          let accesstoken = await this.jwtTokenService.sign({
            id: user.id,
            email: user.email,
            JWT_SECRET: process.env.JWT_SECRET,
          });
          return await response.send({
            status: 200,
            message: 'Logged In Succcesfully',
            data: { id: user.id, email: user.email, accesstoken },
          });
        }
      }
    } catch (error) {
      return response.send({
        status: 401,
        message: 'Login Failure',
        error: error,
      });
    }
  }

  //enable Google2fa
  async Googl2faStatus(
    @Param() id: string,
    @Body() dto: UserCredentialsDto,
    @Req() request: any,
    @Res() response: any,
  ): Promise<any> {
    const user: any = await this.usersModel.findOne({ id });

    try {
      if (!user) {
        return await response.send({
          status: 200,
          message: 'User Not Found',
        });
      } else {
        const enable: any = await this.usersModel.updateOne(
          { user },
          { ...dto },
        );

        return await response.send({
          status: 200,
          message: 'Update SuccessFully',
          error: enable,
        });
      }
    } catch (error) {
      return await response.send({
        status: 401,
        message: 'Update Failed',
        error: error,
      });
    }
  }
  //enable Phone2fa

  async Mobile2faStatus(
    @Param() id: string,

    @Body() dto: UserCredentialsDto,
    @Req() request: any,
    @Res() response: any,
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
        await response.send({
          status: 200,
          message: 'Mobile 2fa Enabled SuccesFully',
          data: enable,
        });
        return;
      }
    } catch (error) {
      return await response.send({
        status: 401,
        message: 'Update Failed',
        error: error,
      });
    }
  }
  //enable E-Mail2fa

  async email2faStatus(
    @Param() id: string,

    @Body() dto: UserCredentialsDto,
    @Req() request: any,
    @Res() response: any,
  ): Promise<any> {
    const user: any = await this.usersModel.findOne({ id });
    const getsecret = Speakeasy.generateSecret({ length: 20 });

    try {
      if (!user) {
        return new BadRequestException('user not  existed');
      } else {
        const enable: any = await this.usersModel.updateOne(
          { user },
          { ...dto },
        );
        await response.send({
          status: 200,
          message: 'email 2fa Enabled SuccesFully',
          data: enable,
          getsecret,
        });
        return { enable };
      }
    } catch (error) {
      return await response.send({
        status: 401,
        message: 'Update Failed',
        error: error,
      });
    }
  }

  async disableEmail2faStatus(
    @Param() id: string,

    @Body() dto: UserCredentialsDto,
    @Req() request: any,
    @Res() response: any,
  ): Promise<any> {
    const user: any = await this.usersModel.findOne({ id });
    const key = dto.emailToken;
    try {
      if (!user) {
        return new BadRequestException('user not  existed');
      } else {
        const disable: any = await this.usersModel.updateOne(
          { user },
          { $pull: { key } },
        );
        await response.send({
          status: 200,
          message: 'email 2fa Enabled SuccesFully',
          data: disable,
        });
        return { disable };
      }
    } catch (error) {
      return await response.send({
        status: 401,
        message: 'Update Failed',
        error: error,
      });
    }
  }
  async disableMobile2faStatus(
    @Param() id: string,

    @Body() dto: UserCredentialsDto,
    @Req() request: any,
    @Res() response: any,
  ): Promise<any> {
    const user: any = await this.usersModel.findOne({ id });
    const key = dto.mobileToken;
    try {
      if (!user) {
        return new BadRequestException('user not  existed');
      } else {
        const disable: any = await this.usersModel.updateOne(
          { user },
          { $pull: { key } },
        );
        await response.send({
          status: 200,
          message: 'mobile 2fa Enabled SuccesFully',
          data: disable,
        });
        return { disable };
      }
    } catch (error) {
      return await response.send({
        status: 401,
        message: 'Update Failed',
        error: error,
      });
    }
  }
  //Update User Api
  async updateUser(
    @Param() id: string,
    @Body() dto: UserCredentialsDto,
    @Req() request: any,
    @Res() response: any,
  ): Promise<any> {
    const user: any = await this.usersModel.findOne({ id });

    try {
      if (!user) {
        return await response.send({
          status: 200,
          message: 'User Not Found',
          data: undefined,
        });
      } else {
        const enable: any = await this.usersModel.updateOne(
          { user },
          { ...dto },
        );
        return await response.send({
          status: 200,
          message: 'Update SuccessFully',
          data: enable,
        });
      }
    } catch (error) {
      return await response.send({
        status: 401,
        message: 'Update Failed',
        error: error,
      });
    }
  }
}
