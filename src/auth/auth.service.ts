import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { DuplicateEntryException } from '../common/exceptions/custom.exception';
import * as bcrypt from 'bcrypt';
import { CustomLogger } from 'src/common/services/logger.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private readonly logger: CustomLogger,
  ) {}

  async login(loginDto: LoginDto) {
    this.logger.log(`Login attempt for user: ${loginDto.email}`, 'AuthService');
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      relations: ['role'],
    });

    if (!user) {
      this.logger.warn(
        `Failed login attempt for user: ${loginDto.email}`,
        'AuthService',
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      this.logger.warn(
        `Invalid password for user: ${loginDto.email}`,
        'AuthService',
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role.name };
    this.logger.log(
      `Successful login for user: ${loginDto.email}`,
      'AuthService',
    );

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role.name,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    this.logger.log(
      `Registration attempt for user: ${registerDto.email}`,
      'AuthService',
    );
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      this.logger.warn(
        `Registration failed: Email ${registerDto.email} already exists`,
        'AuthService',
      );
      throw new DuplicateEntryException(
        `User with email ${registerDto.email} already exists`,
      );
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = this.userRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      role: { id: registerDto.roleId },
      createdAt: new Date(),
    });

    await this.userRepository.save(user);
    const { password, ...result } = user;
    this.logger.log(
      `Successfully registered user: ${registerDto.email}`,
      'AuthService',
    );
    return result;
  }
}
