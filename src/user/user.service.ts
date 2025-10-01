import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    // Get all users
    async findAll() {
        return this.prisma.user.findMany({ include: { posts: true }, });
    }

    // Create a new user
    async create(data: CreateUserDto) {
        return "okay"
        // return this.prisma.user.create({ data });
    }

}
