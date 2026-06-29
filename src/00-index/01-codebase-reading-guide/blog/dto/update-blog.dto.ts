import { IsString } from "class-validator";
export class UpdateBlogDto{
    @IsString()
    title!: string

    @IsString()
    content?: string

    @IsString()
    author?: string
}