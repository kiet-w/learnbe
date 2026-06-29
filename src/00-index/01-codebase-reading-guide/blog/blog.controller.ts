import { Controller, UseFilters, Post, ValidationPipe, UsePipes, Body } from "@nestjs/common";
import { BlogService } from "./blog.service";
import { CreateBlogDto } from "./dto/create-blog.dto";
import { ResponeBlogDto } from "./dto/respone-blog.dto";
@Controller('blog')
export class BlogController {
    constructor(private readonly blogSerivce: BlogService){}

    @Post()
    @UsePipes(ValidationPipe)
    async create(@Body() createBlogDto: CreateBlogDto): Promise<ResponeBlogDto>{
        return this.blogSerivce.create(createBlogDto)
    }

}