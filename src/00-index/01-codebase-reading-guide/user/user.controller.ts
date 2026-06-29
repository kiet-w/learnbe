import { Controller, Post, Body, Get, UsePipes, ValidationPipe, Patch, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ResponeUserDto } from './dto/respone-user.dto';
import { title } from 'process';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post()
  async create( 
    @Body() createUserDto: CreateUserDto, 
  ): Promise<ResponeUserDto> {
    return this.userService.create(createUserDto);
  }
  @Get()
  async findMany(): Promise<ResponeUserDto[]>{
    return this.userService.findMany()
  }
  @Get(':title')
  async findUnique(): Promise<ResponeUserDto>{
    return  this.userService.findByTitle(title)
  }
  @Patch('title')
  async updateTitle(
    @Query('title') title:string,
    @Body() updateUserDto: UpdateUserDto,): Promise<ResponeUserDto>{
      return this.userService.updateTitle(title,updateUserDto)
    }
  
}