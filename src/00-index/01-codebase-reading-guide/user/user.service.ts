import { CreateUserDto } from "./dto/create-user.dto";
import { ResponeUserDto } from "./dto/respone-user.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { Injectable, Res, NotFoundException } from "@nestjs/common";
import { plainToInstance } from 'class-transformer';
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<ResponeUserDto> {
    const newUser = await this.prisma.user.create({
      data: {
        ...createUserDto,
      },
    });
    return plainToInstance(ResponeUserDto, newUser);
  }

  async findMany(): Promise<ResponeUserDto[]>{
    const posts = await this.prisma.user.findMany({
      orderBy: {createdAt: 'desc'}
    })
    return plainToInstance(ResponeUserDto, posts)
  }
  async findByTitle(title: string): Promise <ResponeUserDto>{
    const findID = await this.prisma.user.findFirst({
      where: {title}
    })
    return plainToInstance(ResponeUserDto,findID)
  }
  async updateTitle(title: string, updateUserDto: UpdateUserDto): Promise<ResponeUserDto>{
    const userInfo = await this.prisma.user.findFirst({
      where: {title}
    })
    if (!userInfo) {
          throw new NotFoundException(`Không tìm thấy bài viết với tiêu đề: ${title}`);
        }
    const updatePost = await this.prisma.user.update({
      where: {title: userInfo.title },
      data: {
          ...updateUserDto
      }
    })
    return plainToInstance(ResponeUserDto, updatePost)
  }
}