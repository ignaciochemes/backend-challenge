import { Transfer } from "src/Models/Entities/TransferEntity";
import { CompanyResponseDto } from "../CompanyController/CompanyResponseDto";
import { TransferStatus } from "src/Enums/TransferStatusEnum";
import { ApiProperty, ApiSchema } from "@nestjs/swagger";

@ApiSchema({ name: 'TransferResponseDto' })
export class TransferResponseDto {
    @ApiProperty({ description: 'Transfer ID', example: 1 })
    id: number;

    @ApiProperty({ description: 'Transfer UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
    uuid: string;

    @ApiProperty({ description: 'Transfer amount', example: 1000 })
    amount: number;

    @ApiProperty({ description: 'Company details', type: CompanyResponseDto })
    company: Partial<CompanyResponseDto>;

    @ApiProperty({ description: 'Debit account number', example: '123456789012' })
    debitAccount: string;

    @ApiProperty({ description: 'Credit account number', example: '987654321012' })
    creditAccount: string;

    @ApiProperty({ description: 'Transfer date', example: '2023-01-01T00:00:00Z' })
    transferDate: Date;

    @ApiProperty({ description: 'Transfer status', enum: TransferStatus })
    status: TransferStatus;

    @ApiProperty({ description: 'Transfer description', example: 'Transfer description' })
    description?: string;

    @ApiProperty({ description: 'Reference ID', example: 'REF-TEST-001' })
    referenceId?: string;

    @ApiProperty({ description: 'Processed date', example: '2023-01-01T00:00:00Z' })
    processedDate?: Date;

    @ApiProperty({ description: 'Transfer currency', example: 'ARS' })
    currency: string;

    @ApiProperty({ description: 'Transfer creation date', example: '2023-01-01T00:00:00Z' })
    createdAt: Date;

    constructor(transfer: Transfer) {
        this.id = transfer.id;
        this.uuid = transfer.getUuid();
        this.amount = transfer.getAmount();
        this.company = CompanyResponseDto.createSimplified(transfer.getCompanyId());
        this.debitAccount = this.formatAccountNumber(transfer.getDebitAccount());
        this.creditAccount = this.formatAccountNumber(transfer.getCreditAccount());
        this.transferDate = transfer.getTransferDate();
        this.status = transfer.getStatus();
        this.description = transfer.getDescription();
        this.referenceId = transfer.getReferenceId();
        this.processedDate = transfer.getProcessedDate();
        this.currency = transfer.getCurrency() || 'ARS';
        this.createdAt = transfer.createdAt;
    }

    private formatAccountNumber(accountNumber: string): string {
        if (!accountNumber) return '';
        const length = accountNumber.length;
        if (length <= 4) return accountNumber;
        const lastFour = accountNumber.substring(length - 4);
        const maskedPart = '*'.repeat(length - 4);
        return `${maskedPart}${lastFour}`;
    }
}