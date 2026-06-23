import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AlbumResponseDto {
  @ApiProperty({ description: 'The unique identifier of the album' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'The title of the album' })
  @Expose()
  title: string;

  @ApiProperty({
    description: 'The artist of the album',
    required: false,
    nullable: true,
  })
  @Expose()
  artist?: string | null;

  @ApiProperty({
    description: 'The URL to the cover image',
    required: false,
    nullable: true,
  })
  @Expose()
  coverUrl?: string | null;

  @ApiProperty({
    description: 'Flag indicating if this is the default album',
  })
  @Expose()
  isDefault: boolean;

  @ApiProperty({
    description: 'The owner user ID',
  })
  @Expose()
  userId: string;

  @ApiProperty({
    description: 'The date when the album was created',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'The date when the album was last updated',
  })
  @Expose()
  updatedAt: Date;
}
