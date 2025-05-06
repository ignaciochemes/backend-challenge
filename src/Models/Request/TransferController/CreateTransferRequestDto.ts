import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Length, Matches, Max } from "class-validator";
import { TransferStatus } from "src/Enums/TransferStatusEnum";

export class CreateTransferRequestDto {
    @IsNotEmpty({ message: 'Amount is required' })
    @IsNumber({
        maxDecimalPlaces: 2,
        allowNaN: false,
        allowInfinity: false
    }, { message: 'Amount must be a valid number with at most 2 decimal places' })
    @IsPositive({ message: 'Amount must be positive' })
    @Max(1000000, { message: 'Amount cannot exceed 1,000,000' })
    public amount: number;

    @IsNotEmpty({ message: 'Company ID is required' })
    @IsString({ message: 'Company ID must be a string' })
    readonly companyId: string;

    @IsNotEmpty({ message: 'Debit account is required' })
    @IsString({ message: 'Debit account must be a string' })
    @Matches(/^\d{5,12}$/, { message: 'Debit account must contain 5-12 digits' })
    public debitAccount: string;

    @IsNotEmpty({ message: 'Credit account is required' })
    @IsString({ message: 'Credit account must be a string' })
    @Matches(/^\d{5,12}$/, { message: 'Credit account must contain 5-12 digits' })
    public creditAccount: string;

    @IsOptional()
    @IsString({ message: 'Description must be a string' })
    @Length(0, 500, { message: 'Description cannot exceed 500 characters' })
    readonly description?: string;

    @IsOptional()
    @IsString({ message: 'Reference ID must be a string' })
    @Length(0, 50, { message: 'Reference ID cannot exceed 50 characters' })
    readonly referenceId?: string;

    @IsOptional()
    @IsEnum(TransferStatus, { message: 'Invalid transfer status' })
    readonly status?: TransferStatus;

    @IsOptional()
    @IsString({ message: 'Currency must be a string' })
    @Length(3, 3, { message: 'Currency must be a 3-letter code (e.g., ARS, USD)' })
    @Matches(/^[A-Z]{3}$/, { message: 'Currency must be a 3-letter uppercase code' })
    readonly currency?: string;
}