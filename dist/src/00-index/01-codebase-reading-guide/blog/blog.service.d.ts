import { PrismaService } from "../../../prisma/prisma.service";
import { CreateBlogDto } from "./dto/create-blog.dto";
import { ResponeBlogDto } from "./dto/respone-blog.dto";
export declare class BlogService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createBlogDto: CreateBlogDto): Promise<ResponeBlogDto>;
}
