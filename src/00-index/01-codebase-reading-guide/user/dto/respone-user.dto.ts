import { Expose, Exclude } from "class-transformer"
@Exclude()
export class ResponeUserDto{
    @Expose()
    id!: string

    @Expose()
    title!: string

    @Expose()
    content!: string

    @Expose()
    author!: string

    @Expose()
    createdAt!: string

}