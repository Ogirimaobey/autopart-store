import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Role } from '../../common/enums/role.enum';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let authService: AuthService;
  let mockUsersService: any;
  let mockSuppliersService: any;
  let mockJwtService: any;
  let mockConfigService: any;

  beforeEach(async () => {
    mockUsersService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      updateRefreshToken: jest.fn(),
    };

    mockSuppliersService = {
      createProfile: jest.fn(),
      findByUserId: jest.fn(),
    };

    mockJwtService = {
      signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
      verify: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'JWT_SECRET') return 'test-secret';
        if (key === 'JWT_EXPIRES_IN') return '1d';
        if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret';
        if (key === 'JWT_REFRESH_EXPIRES_IN') return '7d';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: SuppliersService, useValue: mockSuppliersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should register a buyer and return tokens', async () => {
    const mockUser: any = {
      _id: '507f1f77bcf86cd799439011',
      fullName: 'John Buyer',
      email: 'buyer@test.com',
      role: Role.BUYER,
      status: 'active',
    };

    mockUsersService.create.mockResolvedValue(mockUser);

    const result = await authService.registerBuyer({
      fullName: 'John Buyer',
      email: 'buyer@test.com',
      password: 'password123',
    });

    expect(result).toHaveProperty('user');
    expect(result).toHaveProperty('tokens');
    expect(result.tokens.accessToken).toBe('mock-jwt-token');
    expect(mockUsersService.create).toHaveBeenCalledWith({
      fullName: 'John Buyer',
      email: 'buyer@test.com',
      password: 'password123',
      phone: undefined,
      role: Role.BUYER,
    });
  });

  it('should register a supplier with pending status and create supplier profile', async () => {
    const mockUser: any = {
      _id: '507f1f77bcf86cd799439022',
      fullName: 'Jane Supplier',
      email: 'supplier@test.com',
      role: Role.SUPPLIER,
      status: 'active',
      save: jest.fn().mockResolvedValue(true),
    };

    const mockProfile: any = {
      _id: '507f1f77bcf86cd799439033',
      businessName: 'Ladipo Auto Parts Hub',
      phone: '+2348011111111',
      approvalStatus: 'pending',
    };

    mockUsersService.findByEmail.mockResolvedValue(null);
    mockUsersService.create.mockResolvedValue(mockUser);
    mockSuppliersService.createProfile.mockResolvedValue(mockProfile);

    const result = await authService.registerSupplier({
      fullName: 'Jane Supplier',
      email: 'supplier@test.com',
      password: 'password123',
      businessName: 'Ladipo Auto Parts Hub',
      businessPhone: '+2348011111111',
      address: {
        street: '12 Ladipo Street',
        city: 'Mushin',
        state: 'Lagos',
        country: 'Nigeria',
      },
    });

    expect(result).toHaveProperty('user');
    expect(result).toHaveProperty('supplierProfile');
    expect(mockUser.status).toBe('pending');
    expect(mockSuppliersService.createProfile).toHaveBeenCalled();
  });

  it('should authenticate user and return tokens on valid login', async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const mockUser: any = {
      _id: '507f1f77bcf86cd799439011',
      fullName: 'John Buyer',
      email: 'buyer@test.com',
      passwordHash: hashedPassword,
      role: Role.BUYER,
      status: 'active',
    };

    mockUsersService.findByEmail.mockResolvedValue(mockUser);

    const result = await authService.login({
      email: 'buyer@test.com',
      password: 'password123',
    });

    expect(result).toHaveProperty('tokens');
    expect(result.tokens.accessToken).toBe('mock-jwt-token');
  });
});
