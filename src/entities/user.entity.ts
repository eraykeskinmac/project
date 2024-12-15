import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from './role.entity';

@Entity()
export class User {
  @ApiProperty({ example: 1, description: 'Unique identifier of the user' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address of the user',
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: 'Hashed password of the user' })
  @Column()
  password: string;

  @ApiProperty({ type: () => Role })
  @ManyToOne(() => Role, (role) => role.users)
  role: Role;

  @ApiProperty({
    example: '2024-12-12T00:00:00.000Z',
    description: 'Creation date of the user',
  })
  @Column()
  createdAt: Date;
}
