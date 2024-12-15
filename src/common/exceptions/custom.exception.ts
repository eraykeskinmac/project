import { HttpException, HttpStatus } from '@nestjs/common';

export class BookNotFoundException extends HttpException {
  constructor(id: number) {
    super(
      {
        status: HttpStatus.NOT_FOUND,
        error: 'Not Found',
        message: `Book with ID ${id} not found`,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class BookStoreNotFoundException extends HttpException {
  constructor(id: number) {
    super(
      {
        status: HttpStatus.NOT_FOUND,
        error: 'Not Found',
        message: `Bookstore with ID ${id} not found`,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class InsufficientStockException extends HttpException {
  constructor(bookId: number, available: number) {
    super(
      {
        status: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: `Insufficient stock for book ${bookId}. Available: ${available}`,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class DuplicateEntryException extends HttpException {
  constructor(message: string) {
    super(
      {
        status: HttpStatus.CONFLICT,
        error: 'Conflict',
        message,
      },
      HttpStatus.CONFLICT,
    );
  }
}
