import { Exclude, Expose } from "class-transformer";
import { IsString } from "class-validator";
@Exclude()
export class ResponeBlogDto{
    @Expose()
    id!: string

    @Expose()
    title!: string

    @Expose()
    content!: string

    @Expose()
    author!: string

    @Expose()
    createdAt!: Date
}