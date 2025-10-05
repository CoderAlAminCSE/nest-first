import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { Post } from '@prisma/client';
import { PaginationService } from 'src/common/pagination/pagination.service'; 

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService, private readonly paginationService: PaginationService,) {}

  // Create a new post
  async create(userId: number, dto: CreatePostDto): Promise<Post> {
    return this.prisma.post.create({
      data: {
        title: dto.title,
        content: dto.content,
        published: dto.published ?? false,
        authorId: userId,
      },
    });
  }

  // Get all posts
  async findAll(page: number = 1, pageSize: number = 10) {
    // Use pagination service
    const { skip, take, totalPages, currentPage } =
      this.paginationService.paginate(page, pageSize);

    // Get data + total count together
    const [posts, totalCount] = await Promise.all([
      this.prisma.post.findMany({
        skip,
        take,
        orderBy: { id: 'desc' },
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      this.prisma.post.count(),
    ]);

    // Recalculate totalPages based on actual count
    const totalPagesFinal = this.paginationService.calculateTotalPages(
      totalCount,
      pageSize,
    );

    return {
      data: posts,
      meta: {
        totalCount,
        currentPage,
        pageSize,
        totalPages: totalPagesFinal,
      },
    };
  }
}
