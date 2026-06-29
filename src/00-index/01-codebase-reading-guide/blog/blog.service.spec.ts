import { Test, TestingModule } from '@nestjs/testing';
import { BlogService } from './blog.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { InternalServerErrorException } from '@nestjs/common';

describe('BlogService', () => {
  let service: BlogService;
  let prisma: PrismaService;

  const mockPrismaService = {
    blog: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BlogService>(BlogService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a blog post and return the response DTO', async () => {
      const createBlogDto: CreateBlogDto = {
        title: 'Test Title',
        content: 'Test Content',
        author: 'Test Author',
      };

      const mockDbResponse = {
        id: 'blog-id-123',
        title: 'Test Title',
        content: 'Test Content',
        author: 'Test Author',
        createdAt: new Date(),
      };

      mockPrismaService.blog.create.mockResolvedValue(mockDbResponse);

      const result = await service.create(createBlogDto);

      expect(prisma.blog.create).toHaveBeenCalledWith({
        data: createBlogDto,
      });
      expect(result).toBeDefined();
      expect(result.id).toBe(mockDbResponse.id);
      expect(result.title).toBe(mockDbResponse.title);
      expect(result.content).toBe(mockDbResponse.content);
      expect(result.author).toBe(mockDbResponse.author);
    });

    it('should throw InternalServerErrorException when prisma create fails with standard error', async () => {
      const createBlogDto: CreateBlogDto = {
        title: 'Test Title',
        content: 'Test Content',
        author: 'Test Author',
      };

      mockPrismaService.blog.create.mockRejectedValue(new Error('DB Error'));

      await expect(service.create(createBlogDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
