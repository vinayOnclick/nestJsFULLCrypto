import {
  Controller,
  SetMetadata,
  Request,
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

@Controller('user')
@ApiTags('Users')
@ApiSecurity('api_key')
export class UsersController {
  constructor(
    private userService: UsersService,
    AuthCredentialsDto: AuthCredentialsDto,
  ) {}
  @Post('/register')
  async signIn(@Body() userDto: UserCredentialsDto, @Req() req) {
    const vin = await this.userService.register(userDto, req);
    return vin;
  }
  @Post('/login')
  async logIn(@Body() authCredentialsDto: AuthCredentialsDto, @Request() req) {
    return await this.userService.login(authCredentialsDto, req);
  }

  @Put('/verifyEmail')
  async verifyEmail(
    @Body() UserCredentialsDto: UserCredentialsDto,
    @Request() req,
  ) {
    return await this.userService.emailVerify(UserCredentialsDto, req);
  }

  @Put('/verifyMobile')
  async verifyPhone(@Body() userDto: UserCredentialsDto, @Request() req) {
    return await this.userService.phoneVerify(userDto, req);
  }

  @Patch('/enableGoogle2fa/:id')
  async enableGoogle2fa(
    @Param() id: any,
    @Request() req,

    @Body() userDto: UserCredentialsDto,
  ) {
    return await this.userService.Googl2faStatus(id, userDto, req);
  }

  @Patch('/enableEmail2fa/:id')
  async enableEmail2fa(
    @Param() id: any,
    @Request() req,

    @Body() userDto: UserCredentialsDto,
  ) {
    return await this.userService.Googl2faStatus(id, userDto, req);
  }

  @Patch('/enableMobile2fa/:id')
  async enableMobile2fa(
    @Param() id: any,
    @Request() req,

    @Body() userDto: UserCredentialsDto,
  ) {
    return await this.userService.Googl2faStatus(id, userDto, req);
  }
  @Patch('/updateUser/:id')
  async updateUser(
    @Param() id: any,
    @Request() req,

    @Body() userDto: UserCredentialsDto,
  ) {
    return await this.userService.updateUser(id, userDto, req);
  }

}
