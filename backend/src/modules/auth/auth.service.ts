import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { RegisterBuyerDto } from './dto/register-buyer.dto';
import { RegisterSupplierDto } from './dto/register-supplier.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '../../common/enums/role.enum';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly suppliersService: SuppliersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async registerBuyer(dto: RegisterBuyerDto) {
    const user = await this.usersService.create({
      fullName: dto.fullName,
      email: dto.email,
      password: dto.password,
      phone: dto.phone,
      role: Role.BUYER,
    });

    const tokens = await this.generateTokens(user);
    await this.updateRefreshTokenHash(user._id.toString(), tokens.refreshToken);

    return {
      user,
      tokens,
    };
  }

  async registerSupplier(dto: RegisterSupplierDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    // 1. Create user account with status: pending
    const user = await this.usersService.create({
      fullName: dto.fullName,
      email: dto.email,
      password: dto.password,
      phone: dto.phone,
      role: Role.SUPPLIER,
    });

    // Explicitly set supplier status to pending
    user.status = 'pending';
    await user.save();

    // 2. Create supplier profile
    const supplierProfile = await this.suppliersService.createProfile(
      user._id.toString(),
      {
        businessName: dto.businessName,
        phone: dto.businessPhone || dto.phone || '',
        address: dto.address,
        cacNumber: dto.cacNumber,
        description: dto.description,
        logoUrl: dto.logoUrl,
      },
    );

    const tokens = await this.generateTokens(user);
    await this.updateRefreshTokenHash(user._id.toString(), tokens.refreshToken);

    return {
      user,
      supplierProfile,
      tokens,
      message:
        'Supplier registration submitted. Account is pending admin approval.',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status === 'suspended') {
      throw new UnauthorizedException(
        'Your account has been suspended. Please contact support.',
      );
    }

    let supplierProfile: any = null;
    if (user.role === Role.SUPPLIER) {
      supplierProfile = await this.suppliersService.findByUserId(
        user._id.toString(),
      );
    }

    const tokens = await this.generateTokens(user);
    await this.updateRefreshTokenHash(user._id.toString(), tokens.refreshToken);

    return {
      user,
      supplierProfile,
      tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const refreshSecret =
        this.configService.get<string>('JWT_REFRESH_SECRET') ||
        'super-secret-refresh-key-autopart-marketplace-2025';

      const payload = this.jwtService.verify(refreshToken, {
        secret: refreshSecret,
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.refreshTokenHash) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isTokenMatch = await bcrypt.compare(
        refreshToken,
        user.refreshTokenHash,
      );
      if (!isTokenMatch) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const tokens = await this.generateTokens(user);
      await this.updateRefreshTokenHash(
        user._id.toString(),
        tokens.refreshToken,
      );

      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return { success: true, message: 'Successfully logged out' };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't leak whether email exists
      return {
        message:
          'If an account exists with this email, a password reset link has been sent.',
      };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = hash;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // In a production environment with mailer configured, send the email here.
    // For local testing & development, return resetToken or log it.
    return {
      message:
        'If an account exists with this email, a password reset link has been sent.',
      resetToken, // Included for dev testing
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await (this.usersService as any).userModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException(
        'Password reset token is invalid or has expired',
      );
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return { message: 'Password has been successfully updated' };
  }

  async generateTokens(user: any) {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const jwtSecret =
      this.configService.get<string>('JWT_SECRET') ||
      'super-secret-jwt-key-autopart-marketplace-2025';
    const refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      'super-secret-refresh-key-autopart-marketplace-2025';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: jwtSecret,
        expiresIn: (this.configService.get<string>('JWT_EXPIRES_IN') ||
          '1d') as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ||
          '7d') as any,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 86400, // 24 hours in seconds
    };
  }

  private async updateRefreshTokenHash(userId: string, refreshToken: string) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(refreshToken, salt);
    await this.usersService.updateRefreshToken(userId, hash);
  }
}
