import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BookStoreBook } from './bookstore-book.entity';

@Entity()
export class Book {
  @ApiProperty({ example: 1, description: 'Unique identifier of the book' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Clean Code', description: 'Title of the book' })
  @Column()
  title: string;

  @ApiProperty({
    example: 'Robert C. Martin',
    description: 'Author of the book',
  })
  @Column()
  author: string;

  @ApiProperty({ example: '9780132350884', description: 'ISBN of the book' })
  @Column()
  isbn: string;

  @ApiProperty({ example: 44.99, description: 'Price of the book' })
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @ApiProperty({ type: () => [BookStoreBook] })
  @OneToMany(() => BookStoreBook, (bookStoreBook) => bookStoreBook.book)
  bookStores: BookStoreBook[];
}
