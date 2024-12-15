import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Book } from './book.entity';
import { BookStore } from './bookstore.entity';

@Entity()
export class BookStoreBook {
  @ApiProperty({
    example: 1,
    description: 'Unique identifier of the bookstore-book relation',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: () => Book })
  @ManyToOne(() => Book, (book) => book.bookStores)
  book: Book;

  @ApiProperty({ type: () => BookStore })
  @ManyToOne(() => BookStore, (bookStore) => bookStore.books)
  bookStore: BookStore;

  @ApiProperty({ example: 10, description: 'Quantity of books in stock' })
  @Column()
  quantity: number;
}
