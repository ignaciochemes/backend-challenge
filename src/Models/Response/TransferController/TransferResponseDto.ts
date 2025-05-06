import { Transfer } from "src/Models/Entities/TransferEntity";
import { CompanyResponseDto } from "../CompanyController/CompanyResponseDto";
import { TransferStatus } from "src/Enums/TransferStatusEnum";

export class TransferResponseDto {
    id: number;
    uuid: string;
    amount: number;
    company: Partial<CompanyResponseDto>;
    debitAccount: string;
    creditAccount: string;
    transferDate: Date;
    status: TransferStatus;
    description?: string;
    referenceId?: string;
    processedDate?: Date;
    currency: string;
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