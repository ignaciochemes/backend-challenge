import { ApiProperty, ApiPropertyOptional, ApiSchema } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, Matches } from "class-validator";

@ApiSchema({ name: 'CreateCompanyRequestDto' })
export class CreateCompanyRequestDto {
    @IsNotEmpty({ message: 'CUIT is required' })
    @IsString({ message: 'CUIT must be a string' })
    @Matches(/^(20|23|24|25|26|27|30|33|34)(-\d{8}-\d{1}|\d{9})$/, {
        message: 'CUIT must follow the pattern: 2X-XXXXXXXX-X or 3XXXXXXXXX',
    })
    @ApiProperty({ description: 'Company CUIT', example: '20-12345678-9' })
    readonly cuit: string;

    @IsNotEmpty({ message: 'Business name is required' })
    @IsString({ message: 'Business name must be a string' })
    @Length(3, 100, { message: 'Business name must be between 3 and 100 characters' })
    @ApiProperty({ description: 'Company business name', example: 'My Company' })
    readonly businessName: string;

    @IsOptional()
    @IsString({ message: 'Address must be a string' })
    @Length(0, 255, { message: 'Address cannot exceed 255 characters' })
    @ApiPropertyOptional({ description: 'Company address', example: '123 Main St' })
    readonly address?: string;

    @IsOptional()
    @IsEmail({}, { message: 'Invalid email format' })
    @ApiPropertyOptional({ description: 'Company contact email', example: 'example@example.com' })
    readonly contactEmail?: string;

    @IsOptional()
    @IsString({ message: 'Contact phone must be a string' })
    @Matches(/^(\+)?[0-9]{8,15}$/, {
        message: 'Contact phone must contain 8-15 digits, optionally with a leading + symbol',
    })
    @ApiPropertyOptional({ description: 'Company contact phone', example: '+54123456789' })
    readonly contactPhone?: string;
}