import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { db } from '@repo/db';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async register(dto: RegisterDto) {
    // 1. Check if user already exists
    const existingUser = await db.user.findUnique({ where: { email: dto.email } });
    if (existingUser) throw new UnauthorizedException('Email already in use');

    // 2. Hash the password (10 is the "salt rounds")
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. Save to database
    const newUser = await db.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
      },
    });

    // 4. Return user without the password
    const { password, ...result } = newUser;
    return result;
  }

  async login(dto: LoginDto) {
    // 1. Find the user
    const user = await db.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // 2. Compare the hashes
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    // 3. Mint the VIP Wristband (JWT)
    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}

