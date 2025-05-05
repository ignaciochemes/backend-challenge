import { Company } from "src/Models/Entities/CompanyEntity";

export class CompanyResponseDto {
    id: number;
    cuit: string;
    businessName: string;
    adhesionDate: Date;

    constructor(company: Company) {
        this.id = company.id;
        this.cuit = company.getCuit();
        this.businessName = company.getBusinessName();
        this.adhesionDate = company.getAdhesionDate();
    }
}