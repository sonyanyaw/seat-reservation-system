import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ description: 'id мероприятия' })
  @IsInt()
  @Min(1)
  event_id: number;

  @ApiProperty({ description: 'id пользователя' })
  @IsString()
  @IsNotEmpty()
  user_id: string;
}
