import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Query
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  // create post
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: any, @Body() dto: CreatePostDto) {
    const userId = req.user?.userId;
    return this.postsService.create(userId, dto);
  }

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.postsService.findAll(+page, +limit);
  }
}
