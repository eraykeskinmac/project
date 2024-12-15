import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BookStoreBook } from './bookstore-book.entity';

@Entity()
export class BookStore {
  @ApiProperty({
    example: 1,
    description: 'Unique identifier of the bookstore',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Downtown Books',
    description: 'Name of the bookstore',
  })
  @Column()
  name: string;

  @ApiProperty({
    example: '123 Main Street',
    description: 'Address of the bookstore',
  })
  @Column()
  address: string;

  @ApiProperty({ type: () => [BookStoreBook] })
  @OneToMany(() => BookStoreBook, (bookStoreBook) => bookStoreBook.bookStore)
  books: BookStoreBook[];
}
