import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { GenericTable } from "./GenericTable";
import { Company } from "./CompanyEntity";

@Entity()
export class Transfer extends GenericTable {
    @PrimaryGeneratedColumn()
    public id: number;

    @Index({ unique: true })
    @Column({ nullable: false, type: 'uuid' })
    private uuid: string;

    @Column({ nullable: false, type: 'numeric', precision: 10, scale: 2, default: 0 })
    private amount: number;

    @ManyToOne(() => Company, (company) => company.id)
    @JoinColumn({ name: 'company_id' })
    private companyId: Company;

    @Column({ nullable: false, length: 50, name: 'debit_account' })
    private debitAccount: string;

    @Column({ nullable: false, length: 50, name: 'credit_account' })
    private creditAccount: string;

    @Column({ nullable: false, type: 'timestamp', name: 'transfer_date' })
    private transferDate: Date;

    public getUuid(): string {
        return this.uuid;
    }

    public setUuid(uuid: string): void {
        this.uuid = uuid;
    }

    public getAmount(): number {
        return this.amount;
    }

    public setAmount(amount: number): void {
        this.amount = amount;
    }

    public getCompanyId(): Company {
        return this.companyId;
    }

    public setCompanyId(companyId: Company): void {
        this.companyId = companyId;
    }

    public getDebitAccount(): string {
        return this.debitAccount;
    }

    public setDebitAccount(debitAccount: string): void {
        this.debitAccount = debitAccount;
    }

    public getCreditAccount(): string {
        return this.creditAccount;
    }

    public setCreditAccount(creditAccount: string): void {
        this.creditAccount = creditAccount;
    }

    public getTransferDate(): Date {
        return this.transferDate;
    }

    public setTransferDate(transferDate: Date): void {
        this.transferDate = transferDate;
    }

}