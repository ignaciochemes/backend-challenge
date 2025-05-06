import { BeforeInsert, BeforeUpdate, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { GenericTable } from "./GenericTable";
import { Company } from "./CompanyEntity";
import { TransferStatus } from "../../Enums/TransferStatusEnum";

@Entity()
export class Transfer extends GenericTable {
    @PrimaryGeneratedColumn()
    public id: number;

    @Index({ unique: true })
    @Column({ nullable: false, type: 'uuid' })
    private uuid: string;

    @Column({
        nullable: false,
        type: 'numeric',
        precision: 10,
        scale: 2,
        default: 0,
        transformer: {
            to: (value: number) => Math.abs(value),
            from: (value: string) => parseFloat(value)
        }
    })
    private amount: number;

    @ManyToOne(() => Company, (company) => company.id, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'company_id' })
    private companyId: Company;

    @Column({ nullable: false, length: 50, name: 'debit_account' })
    private debitAccount: string;

    @Column({ nullable: false, length: 50, name: 'credit_account' })
    private creditAccount: string;

    @Column({ nullable: false, type: 'timestamp', name: 'transfer_date' })
    private transferDate: Date;

    @Column({
        nullable: false,
        type: 'enum',
        enum: TransferStatus,
        default: TransferStatus.PENDING,
        name: 'status'
    })
    private status: TransferStatus;

    @Column({ nullable: true, type: 'text', name: 'description' })
    private description: string;

    @Column({ nullable: true, type: 'text', name: 'reference_id' })
    private referenceId: string;

    @Column({ nullable: true, type: 'timestamp', name: 'processed_date' })
    private processedDate: Date;

    @Column({ nullable: true, length: 50, name: 'currency', default: 'ARS' })
    private currency: string;

    @BeforeInsert()
    @BeforeUpdate()
    validateData() {
        if (this.amount <= 0) {
            throw new Error('Transfer amount must be greater than zero');
        }
        if (this.debitAccount === this.creditAccount) {
            throw new Error('Debit and credit accounts cannot be the same');
        }
        this.debitAccount = this.debitAccount.replace(/\D/g, '');
        this.creditAccount = this.creditAccount.replace(/\D/g, '');
        if (this.status && !Object.values(TransferStatus).includes(this.status)) {
            this.status = TransferStatus.PENDING;
        }
        if (
            (this.status === TransferStatus.COMPLETED || this.status === TransferStatus.FAILED) &&
            !this.processedDate
        ) {
            this.processedDate = new Date();
        }
    }

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

    public getStatus(): TransferStatus {
        return this.status;
    }

    public setStatus(status: TransferStatus): void {
        this.status = status;
    }

    public getDescription(): string {
        return this.description;
    }

    public setDescription(description: string): void {
        this.description = description;
    }

    public getReferenceId(): string {
        return this.referenceId;
    }

    public setReferenceId(referenceId: string): void {
        this.referenceId = referenceId;
    }

    public getProcessedDate(): Date {
        return this.processedDate;
    }

    public setProcessedDate(processedDate: Date): void {
        this.processedDate = processedDate;
    }

    public getCurrency(): string {
        return this.currency;
    }

    public setCurrency(currency: string): void {
        this.currency = currency;
    }

}