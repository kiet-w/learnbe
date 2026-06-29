import { User } from "@prisma/client"
import { IsOptional, IsString, MaxLength } from "class-validator"

export class UpdateUserDto {

    @IsString()
    title!: string

    @IsString()
    @IsOptional()
    @MaxLength(25)
    content?: string
}