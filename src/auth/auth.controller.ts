import { Controller, Post, Body, UnauthorizedException, UseGuards, Request } from '@nestjs/common';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    try {
      return await this.authService.login(dto.email, dto.password);
    } catch {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify')
  verify(@Request() req: { user: { userId: number; email: string } }) {
    return { valid: true, user: req.user };
  }

  @UseGuards(JwtAuthGuard)
  @Post('me')
  me(@Request() req: { user: { userId: number; email: string } }) {
    return req.user;
  }
}
