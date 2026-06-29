import { CreateUserDto } from "./dto/create-user.dto";
import { ResponeUserDto } from "./dto/respone-user.dto";
import { PrismaService } from "../../../prisma/prisma.service";
import { UpdateUserDto } from "./dto/update-user.dto";
export declare class UserService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createUserDto: CreateUserDto): Promise<ResponeUserDto>;
    findMany(): Promise<ResponeUserDto[]>;
    findByTitle(title: string): Promise<ResponeUserDto>;
    updateTitle(title: string, updateUserDto: UpdateUserDto): Promise<ResponeUserDto>;
}
