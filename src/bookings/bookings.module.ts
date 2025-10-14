import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './booking.entity';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Event } from '../events/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking])],
  providers: [BookingsService],
  controllers: [BookingsController],
})
export class BookingsModule {}
