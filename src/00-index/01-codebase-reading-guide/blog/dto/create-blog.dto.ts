import { IsNotEmpty, IsString } from "class-validator";
export class CreateBlogDto{
    @IsString()
    @IsNotEmpty({message: ' tieu de khong duoc bo trong '})
    title!: string

    @IsString()
    content?: string

    @IsString()
    author?: string
}