import { Test, TestingModule } from '@nestjs/testing';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { ResponeBlogDto } from './dto/respone-blog.dto';

describe('BlogController', () => {
  let controller: BlogController;
  let service: BlogService;

  const mockBlogService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogController],
      providers: [
        {
          provide: BlogService,
          useValue: mockBlogService,
        },
      ],
    }).compile();

    controller = module.get<BlogController>(BlogController);
    service = module.get<BlogService>(BlogService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a blog post and return ResponeBlogDto', async () => {
      const createBlogDto: CreateBlogDto = {
        title: 'Test Title',
        content: 'Test Content',
        author: 'Test Author',
      };

      const mockResponse: ResponeBlogDto = {
        id: 'blog-id-123',
        title: 'Test Title',
        content: 'Test Content',
        author: 'Test Author',
        createdAt: new Date(),
      };

      mockBlogService.create.mockResolvedValue(mockResponse);

      const result = await controller.create(createBlogDto);

      expect(service.create).toHaveBeenCalledWith(createBlogDto);
      expect(result).toEqual(mockResponse);
    });
  });
});
