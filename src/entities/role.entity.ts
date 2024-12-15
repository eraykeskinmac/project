import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

@Entity()
export class Role {
  @ApiProperty({ example: 1, description: 'Unique identifier of the role' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'ADMIN', description: 'Name of the role' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ type: () => [User] })
  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
