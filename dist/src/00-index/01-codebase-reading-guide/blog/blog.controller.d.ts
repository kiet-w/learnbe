import { BlogService } from "./blog.service";
import { CreateBlogDto } from "./dto/create-blog.dto";
import { ResponeBlogDto } from "./dto/respone-blog.dto";
export declare class BlogController {
    private readonly blogSerivce;
    constructor(blogSerivce: BlogService);
    create(createBlogDto: CreateBlogDto): Promise<ResponeBlogDto>;
}
