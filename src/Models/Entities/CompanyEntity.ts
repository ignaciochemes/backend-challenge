import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { GenericTable } from "./GenericTable";

@Entity()
export class Company extends GenericTable {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ nullable: false, length: 50 })
    private cuit: string;

    @Column({ nullable: false, length: 50, name: 'business_name' })
    private businessName: string;

    @Column({ nullable: false, type: 'timestamp', name: 'adhesion_date' })
    private adhesionDate: Date;

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

}