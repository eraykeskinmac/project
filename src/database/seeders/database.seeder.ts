import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../entities/role.entity';
import { User } from '../../entities/user.entity';
import { RoleEnum } from '../../enums/role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DatabaseSeeder {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async seed() {
    await this.seedRoles();
    await this.seedAdmin();
  }

  private async seedRoles() {
    const roles = [
      { name: RoleEnum.ADMIN },
      { name: RoleEnum.STORE_MANAGER },
      { name: RoleEnum.USER },
    ];

    for (const role of roles) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: role.name },
      });

      if (!existingRole) {
        await this.roleRepository.save(role);
        console.log(`Role ${role.name} created`);
      }
    }
  }

  private async seedAdmin() {
    const adminRole = await this.roleRepository.findOne({
      where: { name: RoleEnum.ADMIN },
    });

    if (!adminRole) {
      console.log('Admin role not found');
      return;
    }

    const existingAdmin = await this.userRepository.findOne({
      where: { email: 'admin@bookstore.com' },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const admin = this.userRepository.create({
        email: 'admin@bookstore.com',
        password: hashedPassword,
        role: adminRole,
        createdAt: new Date(),
      });

      await this.userRepository.save(admin);
      console.log('Admin user created');
    }
  }
}
 