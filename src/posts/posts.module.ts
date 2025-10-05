import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PaginationModule } from '../common/pagination/pagination.module';

@Module({
  imports: [PrismaModule, AuthModule, PaginationModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
