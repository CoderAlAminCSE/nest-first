import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { PaginationService } from 'src/common/pagination/pagination.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService, private readonly paginationService: PaginationService) {}

    // Generate Access + Refresh Tokens
    private async generateTokens(userId: number, email: string, role: string) {
        const payload = { sub: userId, email, role };

        // Access Token
        const accessToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET,
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h',
        });

        // Refresh Token
        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        });

        return { accessToken, refreshToken };
    }

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
        if (!isPasswordValid) { throw new UnauthorizedException('Invalid email or password'); }

        // Generate tokens
        const tokens = await this.generateTokens(user.id, user.email, user.role);

        // Store hashed refresh token in DB for security
        const hashedRt = await bcrypt.hash(tokens.refreshToken, 10);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { hashedRt },
        });

        // Return user and token
        return {
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            ...tokens,
        };
    }

    // Refresh access token using refresh token
    async refresh(refreshToken: string) {
    try {
        // Verify refresh token with refresh secret
        const payload = await this.jwtService.verifyAsync(refreshToken, {
            secret: process.env.JWT_REFRESH_SECRET,
        });

        // Find user
        const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
        if (!user || !user.hashedRt)
            throw new UnauthorizedException('Invalid refresh token');

        // Compare provided token with stored hashed one
        const isRtValid = await bcrypt.compare(refreshToken, user.hashedRt);
        if (!isRtValid) throw new UnauthorizedException('Invalid refresh token');

        // Generate new tokens
        const tokens = await this.generateTokens(user.id, user.email, user.role);

        // Update refresh token in DB
        const hashedRt = await bcrypt.hash(tokens.refreshToken, 10);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { hashedRt },
        });
        
        return {
            message: 'Token refreshed successfully',
            ...tokens,
        };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    }


    // Get all users
    async getAllUsers(page: number = 1, pageSize: number = 10) {
        // Use pagination service
        const { skip, take, totalPages, currentPage } =
        this.paginationService.paginate(page, pageSize);

        // Get data + total count together
        const [users, totalCount] = await Promise.all([
        this.prisma.user.findMany({
            skip,
            take,
            orderBy: { id: 'desc' }
        }),
        this.prisma.user.count(),
        ]);

        // Recalculate totalPages based on actual count
        const totalPagesFinal = this.paginationService.calculateTotalPages(
        totalCount,
        pageSize,
        );

        return {
        data: users,
        meta: {
            totalCount,
            currentPage,
            pageSize,
            totalPages: totalPagesFinal,
        },
        };
    }
}
