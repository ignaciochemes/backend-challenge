import { Company } from "src/Models/Entities/CompanyEntity";
import { Transfer } from "src/Models/Entities/TransferEntity";

export class TransferResponseDto {
    id: number;
    amount: number;
    companyId: Company;
    debitAccount: string;
    creditAccount: string;
    transferDate: Date;

    constructor(trasnfer: Transfer) {
        this.id = trasnfer.id;
        this.amount = trasnfer.getAmount();
        this.companyId = trasnfer.getCompanyId();
        this.debitAccount = trasnfer.getDebitAccount();
        this.creditAccount = trasnfer.getCreditAccount();
        this.transferDate = trasnfer.getTransferDate();
    }
}