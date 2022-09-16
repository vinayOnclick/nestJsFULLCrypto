import {
  Controller,
  SetMetadata,
  Request,
  Response,
  Get,
  Post,
  Body,
  Patch,
  Put,
  ValidationPipe,
  Query,
  Req,
  Res,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiSecurity,
  ApiBearerAuth,
  ApiParam,
  ApiOperation,
  ApiConsumes,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserCredentialsDto } from './dto/user-credentials.dto';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { loginDto } from './dto/userDto';
import { LocalAuthGuard } from 'src/Gaurd/local-authGaurd';
import { IsPhoneNumber } from 'class-validator';
import * as Speakeasy from 'speakeasy';
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';

@Controller('user')
@ApiTags('Users')
@ApiSecurity('api_key')
export class UsersController {
  constructor(
    private userService: UsersService,
    AuthCredentialsDto: AuthCredentialsDto,
  ) {}

  @Post('/register')
  async signIn(@Body() userDto: UserCredentialsDto, @Req() req, @Res() res) {
    const vin = await this.userService.register(userDto, req, res);
    return vin;
  }
  @Post('/login')
  async logIn(
    @Body() authCredentialsDto: AuthCredentialsDto,
    @Req() req,
    @Res() res,
  ) {
    return await this.userService.login(authCredentialsDto, req, res);
  }
  // @UseGuards(LocalAuthGuard)
  // @Post('/Googlelogin')
  // async Googlelogin(@Body() authCredentialsDto: AuthCredentialsDto, @Request() req) {
  //   return await this.userService.login(authCredentialsDto, req);
  // }

  @Put('/verifyEmail')
  async verifyEmail(
    @Body() UserCredentialsDto: UserCredentialsDto,
    @Request() req,
    @Response() res,
  ) {
    return await this.userService.emailVerify(UserCredentialsDto, req, res);
  }

  @Put('/verifyMobile')
  async verifyPhone(
    @Body() userDto: UserCredentialsDto,
    @Request() req,
    @Response() res,
  ) {
    return await this.userService.phoneVerify(userDto, req, res);
  }

  @Patch('/enableGoogle2fa/:id')
  async enableGoogle2fa(
    @Param() id: any,
    @Request() req,
    @Response() res,
    @Body() userDto: UserCredentialsDto,
  ) {
    return await this.userService.Googl2faStatus(id, userDto, req, res);
  }

  @Patch('/enableEmail2fa/:id')
  async enableEmail2fa(
    @Param() id: any,
    @Request() req,
    @Response() res,
    @Body() userDto: UserCredentialsDto,
  ) {
    return await this.userService.Googl2faStatus(id, userDto, req, res);
  }

  @Patch('/enableMobile2fa/:id')
  async enableMobile2fa(
    @Param() id: any,
    @Request() req,
    @Response() res,
    @Body() userDto: UserCredentialsDto,
  ) {
    return await this.userService.Mobile2faStatus(id, userDto, req, res);
  }
  @Patch('/updateUser/:id')
  async updateUser(
    @Param() id: any,
    @Request() req,
    @Response() res,

    @Body() userDto: UserCredentialsDto,
  ) {
    return await this.userService.updateUser(id, userDto, req, res);
  }

  @Post('/secretKey')
  async secretKey() {
    try {
      const secret = this.userService.secretKey();
      return secret
    } catch (error) {
      return error
    }
   
  }

  @Patch('/generate/:id')
  async generate(@Body() userDto: UserCredentialsDto,@Param() id:string) {
    const token = await this.userService.generate2faToken(userDto,id);
    return { token };
  }
  @Patch('/validate/:id')
  async validate(@Body() userDto: UserCredentialsDto,@Param() id:string) {
    const token = await this.userService.validate2fa(userDto,id);
    return { token };
  }
}
