import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateBlogDto } from "./dto/create-blog.dto";
import { ResponeBlogDto } from "./dto/respone-blog.dto";
import { plainToInstance } from "class-transformer";

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBlogDto: CreateBlogDto): Promise<ResponeBlogDto> {
    const createId = await this.prisma.blog.create({
      data: {
        ...createBlogDto
      }
    });
    return plainToInstance(ResponeBlogDto, createId);
  }
}