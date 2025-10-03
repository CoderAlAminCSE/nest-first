import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

    // Register a new user
    async register(dto: CreateUserDto) {
        // Check if email already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new ConflictException('Email already in use');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        // Create user in DB
        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                password: hashedPassword,
                phone: dto.phone,
                address: dto.address,
                role: dto.role,
                isActive: dto.isActive,
                emailVerified: dto.emailVerified,
            },
        });

        // Return user without password
        const { password, ...result } = user as any;
        return result;
    }

    // Login a user
    async login(email: string, password: string) {
        
        const user = await this.prisma.user.findUnique({ where: { email } });

        if (!user) {
        throw new UnauthorizedException('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
        }

        // Create payload for JWT
        const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        };

        const token = this.jwtService.sign(payload);

        // Return user and token
        return {
        message: 'Login successful',
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        access_token: token,
        };
    }
}
