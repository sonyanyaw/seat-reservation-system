import { IsString, IsNotEmpty, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ description: 'Название мероприятия' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Количество мест' })
  @IsNotEmpty()
  @IsInt()
  total_seats: number;
}
