import { BeforeInsert, BeforeUpdate, Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import { GenericTable } from "./GenericTable";

@Entity()
export class Company extends GenericTable {
    @PrimaryGeneratedColumn()
    public id: number;

    @Index({ unique: true })
    @Column({ nullable: false, type: 'uuid', name: 'uuid' })
    private uuid: string;

    @Column({ nullable: false, length: 50 })
    private cuit: string;

    @Column({ nullable: false, length: 50, name: 'business_name' })
    private businessName: string;

    @Column({ nullable: false, type: 'timestamp', name: 'adhesion_date' })
    private adhesionDate: Date;

    @Column({ nullable: true, length: 255, name: 'address' })
    private address: string;

    @Column({ nullable: true, length: 100, name: 'contact_email' })
    private contactEmail: string;

    @Column({ nullable: true, length: 50, name: 'contact_phone' })
    private contactPhone: string;

    @Column({ nullable: true, type: 'boolean', default: true, name: 'is_active' })
    private isActive: boolean;

    @BeforeInsert()
    @BeforeUpdate()
    validateAndFormatData() {
        if (this.cuit && !this.cuit.includes('-')) {
            this.cuit = `${this.cuit.substring(0, 2)}-${this.cuit.substring(2, 10)}-${this.cuit.substring(10, 11)}`;
        }
        if (this.businessName) {
            this.businessName = this.businessName.trim();
        }
    }

    public getUuid(): string {
        return this.uuid;
    }

    public setUuid(uuid: string): void {
        this.uuid = uuid;
    }

    public getCuit(): string {
        return this.cuit;
    }

    public setCuit(cuit: string): void {
        this.cuit = cuit;
    }

    public getBusinessName(): string {
        return this.businessName;
    }

    public setBusinessName(businessName: string): void {
        this.businessName = businessName;
    }

    public getAdhesionDate(): Date {
        return this.adhesionDate;
    }

    public setAdhesionDate(adhesionDate: Date): void {
        this.adhesionDate = adhesionDate;
    }

    public getAddress(): string {
        return this.address;
    }

    public setAddress(address: string): void {
        this.address = address;
    }

    public getContactEmail(): string {
        return this.contactEmail;
    }

    public setContactEmail(contactEmail: string): void {
        this.contactEmail = contactEmail;
    }

    public getContactPhone(): string {
        return this.contactPhone;
    }

    public setContactPhone(contactPhone: string): void {
        this.contactPhone = contactPhone;
    }

    public isIsActive(): boolean {
        return this.isActive;
    }

    public setIsActive(isActive: boolean): void {
        this.isActive = isActive;
    }
}