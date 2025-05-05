import { IsNotEmpty, IsString, Matches } from "class-validator";

export class CreateCompanyRequestDto {

    @IsNotEmpty({ message: 'CUIT is required' })
    @IsString({ message: 'CUIT must be a string' })
    @Matches(/^(20|23|24|25|26|27|30|33|34)(\d{9})$/, {
        message: 'CUIT must follow the pattern: 2X-XXXXXXXX-X or 3X-XXXXXXXX-X',
    })
    readonly cuit: string;

    @IsNotEmpty({ message: 'Business name is required' })
    @IsString({ message: 'Business name must be a string' })
    readonly businessName: string;
}