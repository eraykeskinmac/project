import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../enums/role.enum';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { IdParam } from 'src/common/dto/params.dto';

@ApiTags('books')
@ApiBearerAuth()
@Controller('books')
@UseGuards(JwtAuthGuard)
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @ApiOperation({ summary: 'Create new book' })
  @ApiResponse({ status: 201, description: 'Book successfully created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN)
  create(@Body() createBookDto: CreateBookDto) {
    return this.bookService.create(createBookDto);
  }

  @ApiOperation({ summary: 'Get all books' })
  @ApiResponse({ status: 200, description: 'Return all books' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  findAll() {
    return this.bookService.findAll();
  }

  @ApiOperation({ summary: 'Get book by ID' })
  @ApiResponse({ status: 200, description: 'Return the book' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  @Get(':id')
  findOne(@Param() params: IdParam) {
    return this.bookService.findOne(+params.id);
  }

  @ApiOperation({ summary: 'Update book' })
  @ApiResponse({ status: 200, description: 'Book successfully updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN)
  update(@Param() params: IdParam, @Body() updateBookDto: UpdateBookDto) {
    return this.bookService.update(+params.id, updateBookDto);
  }

  @ApiOperation({ summary: 'Delete book' })
  @ApiResponse({ status: 200, description: 'Book successfully deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN)
  remove(@Param() params: IdParam) {
    return this.bookService.remove(+params.id);
  }
}
