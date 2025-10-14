import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { ApiOperation } from '@nestjs/swagger';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('api/bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post('reserve')
  @ApiOperation({ summary: 'Забронировать' })
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все брони' })
  FindAll() {
    return this.bookingsService.findAll();
  }

  @Get('user')
  @ApiOperation({ summary: 'Получить бронирования пользователя' })
  FindByUserId(@Query('user_id') user_id: string) {
    return this.bookingsService.findByUserId(user_id);
  }

  @Get('event/:event_id')
  @ApiOperation({ summary: 'Получить бронирования события' })
  FindByEventId(@Param('event_id', ParseIntPipe) event_id: number) {
    return this.bookingsService.findByEventId(event_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить бронирование по id' })
  FindOne(@Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.findOne(id);
  }

  // @Delete(':id')
  // delete(@Param('id', ParseIntPipe) id: number) {
  //   return this.bookingsService.remove(id);
  // }
}
