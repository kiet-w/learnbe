import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AlbumService } from './album.service';
import { AlbumResponseDto } from './dto/album-response.dto';
import { CreateAlbumDto } from './dto/create-album.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('albums')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard) // Đã tạm tắt để test cho dễ
@Controller('albums')
@UseInterceptors(ClassSerializerInterceptor)
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {}

  @ApiOperation({ summary: 'Create a new album' })
  @ApiResponse({
    status: 201,
    description: 'The album has been successfully created.',
    type: AlbumResponseDto,
  })
  @Post()
  async create(
    // @CurrentUser() user: { id: string; email: string },
    @Body() createAlbumDto: CreateAlbumDto,
  ): Promise<AlbumResponseDto> {
    const fakeUserId = 'test-user-123';
    return this.albumService.create(fakeUserId, createAlbumDto);
  }

  @ApiOperation({ summary: 'Get an album by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the album.',
    type: AlbumResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Album not found.' })
  @Get(':id')
  async findOne(
    // @CurrentUser() user: { id: string; email: string },
    @Param('id') id: string,
  ): Promise<AlbumResponseDto> {
    const fakeUserId = 'test-user-123';
    const album = await this.albumService.findOne(fakeUserId, id);
    if (!album) {
      throw new NotFoundException(`Album with ID ${id} not found`);
    }
    return album;
  }
}
