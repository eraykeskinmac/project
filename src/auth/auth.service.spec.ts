import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CustomLogger } from 'src/common/services/logger.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let userRepository: any;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: CustomLogger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should throw UnauthorizedException when user not found', async () => {
      const loginDto = { email: 'test@test.com', password: 'test' };
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
        relations: ['role'],
      });
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const hashedPassword = await bcrypt.hash('rightpassword', 10);
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        password: hashedPassword,
        role: { name: 'admin' },
      };
      const loginDto = { email: 'test@test.com', password: 'wrongpassword' };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userRepository.findOne).toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should return token when credentials are valid', async () => {
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        password: hashedPassword,
        role: { name: 'admin' },
      };
      const mockToken = 'test-token';

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login({
        email: mockUser.email,
        password: password,
      });

      expect(userRepository.findOne).toHaveBeenCalled();
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role.name,
      });
      expect(result.access_token).toBe(mockToken);
      expect(result.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role.name,
      });
      expect(mockLogger.log).toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('should throw DuplicateEntryException when email exists', async () => {
      const registerDto = {
        email: 'exists@test.com',
        password: 'test123',
        roleId: 1,
      };
      mockUserRepository.findOne.mockResolvedValue({ id: 1 });

      await expect(service.register(registerDto)).rejects.toThrow();
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should create new user successfully', async () => {
      const registerDto = {
        email: 'new@test.com',
        password: 'test123',
        roleId: 1,
      };
      const mockCreatedUser = {
        id: 1,
        email: registerDto.email,
        role: { id: registerDto.roleId },
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockCreatedUser);
      mockUserRepository.save.mockResolvedValue(mockCreatedUser);

      const result = await service.register(registerDto);

      expect(userRepository.findOne).toHaveBeenCalled();
      expect(userRepository.create).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockCreatedUser);
      expect(mockLogger.log).toHaveBeenCalled();
    });
  });
});
