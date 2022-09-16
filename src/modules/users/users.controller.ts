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
import { AuthGuard } from '@nestjs/passport';
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

  @UseGuards(AuthGuard('jwt'))
  @Put('/verifyEmail')
  async verifyEmail(
    @Body() UserCredentialsDto: UserCredentialsDto,
    @Request() req,
    @Response() res,
  ) {
    return await this.userService.emailVerify(UserCredentialsDto, req, res);
  }
  @UseGuards(AuthGuard('jwt'))
  @Put('/verifyMobile')
  async verifyPhone(
    @Body() userDto: UserCredentialsDto,
    @Request() req,
    @Response() res,
  ) {
    return await this.userService.phoneVerify(userDto, req, res);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/enableGoogle2fa/:id')
  async enableGoogle2fa(
    @Param() id: any,
    @Request() req,
    @Response() res,
    @Body() userDto: UserCredentialsDto,
  ) {
    return await this.userService.Googl2faStatus(id, userDto, req, res);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/enableEmail2fa/:id')
  async enableEmail2fa(
    @Param() id: any,
    @Request() req,
    @Response() res,
    @Body() userDto: UserCredentialsDto,
  ) {
    return await this.userService.email2faStatus(id, userDto, req, res);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/enableMobile2fa/:id')
  async enableMobile2fa(
    @Param() id: any,
    @Request() req,
    @Response() res,
    @Body() userDto: UserCredentialsDto,
  ) {
    return await this.userService.Mobile2faStatus(id, userDto, req, res);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/disableMobile2fa/:id')
  async disableMobile2fa(
    @Param() id: any,
    @Request() req,
    @Response() res,
    @Body() userDto: UserCredentialsDto,
  ) {
    return await this.userService.disableEmail2faStatus(id, userDto, req, res);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/updateUser/:id')
  async updateUser(
    @Param() id: any,
    @Request() req,
    @Response() res,

    @Body() userDto: UserCredentialsDto,
  ) {
    return await this.userService.updateUser(id, userDto, req, res);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/secretKey')
  async secretKey() {
    try {
      const secret = this.userService.secretKey();
      return secret;
    } catch (error) {
      return error;
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/generate/:id')
  async generateEmail2fa(
    @Body() userDto: UserCredentialsDto,
    @Param() id: string,
  ) {
    const token = await this.userService.generateEmail2faToken(userDto, id);
    return { token };
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/validate/:id')
  async validateEmail2fa(
    @Body() userDto: UserCredentialsDto,
    @Param() id: string,
  ) {
    const token = await this.userService.validateEmail2fa(userDto, id);
    return { token };
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/generate/:id')
  async generateMobile2fa(
    @Body() userDto: UserCredentialsDto,
    @Param() id: string,
  ) {
    const token = await this.userService.generateMobile2faToken(userDto, id);
    return { token };
  }
  @UseGuards(AuthGuard('jwt'))
  @Patch('/validate/:id')
  async validateMobile2fa(
    @Body() userDto: UserCredentialsDto,
    @Param() id: string,
  ) {
    const token = await this.userService.validateEmail2fa(userDto, id);
    return { token };
  }
}
