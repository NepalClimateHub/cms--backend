import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MinLength } from 'class-validator'

export class ChangePasswordInput {
  @ApiProperty({
    description: 'Current password',
    example: 'currentPassword123',
  })
  @IsNotEmpty()
  @IsString()
  currentPassword: string

  @ApiProperty({
    description: 'New password',
    example: 'newPassword123',
    minLength: 8,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  newPassword: string
}
