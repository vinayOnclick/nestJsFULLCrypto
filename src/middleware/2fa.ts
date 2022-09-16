import {
  Injectable,
  forwardRef,
  Inject,
  Post,
  Controller,
} from '@nestjs/common';

import { User } from '../modules/users/user.model';
import { UsersService } from '../modules/users/users.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BadRequestException,
  UnauthorizedException,
  Request,
  Response,
  Param,
  Body,
} from '@nestjs/common';
import { UserCredentialsDto } from '../modules/users/dto/user-credentials.dto';

