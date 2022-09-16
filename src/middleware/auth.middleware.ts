// import { AuthService } from '../auth/auth.service';
// import { verify } from 'jsonwebtoken';
// import {
//   NestMiddleware,
//   Injectable,
//   UnauthorizedException,
//   ForbiddenException,
// } from '@nestjs/common';
// import { Request, Response } from 'express';
// import { UsersService } from '../users/users.service';
// import { JwtPayload } from '../middleware/jwt-payload.interface';
// import { ConfigService } from '../config/config.service';
// import * as passport from 'passport'; 
// /** The AuthMiddleware is used to
//  * (1) read the request header bearer token/user access token
//  * (2) decrypt the access token to get the user object
//  */
// @Injectable()
// export class AuthMiddleware implements NestMiddleware {
//   constructor(
//     private authService: AuthService,
//     private readonly userService: UsersService,
//     private configService: ConfigService,
//   ) {}

//   async use(req: Request | any, res: Response, next: () => void) {
//     const bearerHeader = req.headers.authorization;
//     const accessToken = bearerHeader && bearerHeader.split(' ')[1];
//     let user;
//     if (!req.headers.api_key && !bearerHeader)
//       throw new ForbiddenException('Invalid api key');
//     if (req.headers.api_key && !bearerHeader) {
//       const checkKey = await this.authService.validateApiKey(
//         req.headers.api_key,
//       );

//       if (!checkKey) {
//         throw new ForbiddenException('Invalid api key');
//         return false;
//       }
//     }
//     if (!bearerHeader || !accessToken) {
//       return next();
//     }

//     const users: any = await this.authService.verifyToken(accessToken);
//     user = await this.userService.findOneId(users._id);
//     if (!user) throw new ForbiddenException('Please register or sign in.');

//     this.userService.user = user;

//     if (user) {
//       req.user = user;
//     }
//     next();
//   }
// }
