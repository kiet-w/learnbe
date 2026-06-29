import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ResponeUserDto } from './dto/respone-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(createUserDto: CreateUserDto): Promise<ResponeUserDto>;
    findMany(): Promise<ResponeUserDto[]>;
    findUnique(): Promise<ResponeUserDto>;
    updateTitle(title: string, updateUserDto: UpdateUserDto): Promise<ResponeUserDto>;
}
