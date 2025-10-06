import { Controller, Post, Body, UseGuards, Get, Req, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register')
    async register(@Body() dto: CreateUserDto) {
        return this.authService.register(dto);
    }  

    @Post('login')
    async login(@Body() dto: LoginUserDto) {
        return this.authService.login(dto.email, dto.password);
    }

    @Get('users')
    async getAllUsers(@Query('page') page: string = '1', @Query('limit') limit: string = '10',) {
        return this.authService.getAllUsers(+page, +limit);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Req() req: any) {
        return {
            message: 'Protected route accessed',
            user: req.user,
        };
    }

    @Post('refresh')
    async refresh(@Body() body: { refreshToken: string }) {
        return this.authService.refresh(body.refreshToken);
    }
}
