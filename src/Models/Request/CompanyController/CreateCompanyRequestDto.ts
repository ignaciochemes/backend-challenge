import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, Matches, Validate } from "class-validator";
import { CuitValidator } from "src/Helpers/Utils/CuitValidator";

export class CreateCompanyRequestDto {

    @IsNotEmpty({ message: 'CUIT is required' })
    @IsString({ message: 'CUIT must be a string' })
    @Matches(/^(20|23|24|25|26|27|30|33|34)(\d{9})$/, {
        message: 'CUIT must follow the pattern: 2X-XXXXXXXX-X or 3X-XXXXXXXX-X',
    })
    @Validate(CuitValidator, {
        message: 'CUIT is invalid or has an incorrect checksum',
    })
    readonly cuit: string;

    @IsNotEmpty({ message: 'Business name is required' })
    @IsString({ message: 'Business name must be a string' })
    @Length(3, 100, { message: 'Business name must be between 3 and 100 characters' })
    readonly businessName: string;

    @IsOptional()
    @IsString({ message: 'Address must be a string' })
    @Length(0, 255, { message: 'Address cannot exceed 255 characters' })
    readonly address?: string;

    @IsOptional()
    @IsEmail({}, { message: 'Invalid email format' })
    readonly contactEmail?: string;

    @IsOptional()
    @IsString({ message: 'Contact phone must be a string' })
    @Matches(/^(\+)?[0-9]{8,15}$/, {
        message: 'Contact phone must contain 8-15 digits, optionally with a leading + symbol',
    })
    readonly contactPhone?: string;
}