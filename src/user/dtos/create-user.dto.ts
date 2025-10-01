import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, IsEnum } from "class-validator";

export const Role = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  MANAGER: 'MANAGER',
} as const;

export type Role = typeof Role[keyof typeof Role];

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsOptional()
    @IsString()
    address?: string

    @IsEnum(Role, {
        message: `role must be one of: ${Object.values(Role).join(', ')}`,
    })
    role: Role;

    @IsBoolean()
    @IsNotEmpty()
    isActive: boolean;
}