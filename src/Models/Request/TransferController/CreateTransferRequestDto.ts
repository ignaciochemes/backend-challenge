import { IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";

export class CreateTransferRequestDto {
    @IsNotEmpty({ message: 'Amount is required' })
    @IsNumber({}, { message: 'Amount must be a number' })
    @IsPositive({ message: 'Amount must be positive' })
    public amount: number;

    @IsNotEmpty({ message: 'Company ID is required' })
    @IsString({ message: 'Company ID must be a string' })
    readonly companyId: string;

    @IsNotEmpty({ message: 'Debit account is required' })
    @IsString({ message: 'Debit account must be a string' })
    public debitAccount: string;

    @IsNotEmpty({ message: 'Credit account is required' })
    @IsString({ message: 'Credit account must be a string' })
    public creditAccount: string;
}