import { Company } from "src/Models/Entities/CompanyEntity";

export class CompanyResponseDto {
    id: number;
    uuid: string;
    cuit: string;
    businessName: string;
    adhesionDate: Date;
    address?: string;
    contactEmail?: string;
    contactPhone?: string;
    isActive: boolean;
    createdAt: Date;

    constructor(company: Company) {
        this.id = company.id;
        this.uuid = company.getUuid();
        this.cuit = company.getCuit();
        this.businessName = company.getBusinessName();
        this.adhesionDate = company.getAdhesionDate();
        this.address = company.getAddress();
        this.contactEmail = company.getContactEmail();
        this.contactPhone = company.getContactPhone();
        this.isActive = company.isIsActive() ?? true;
        this.createdAt = company.createdAt;
    }

    public static createSimplified(company: Company): Partial<CompanyResponseDto> {
        return {
            id: company.id,
            uuid: company.getUuid(),
            cuit: company.getCuit(),
            businessName: company.getBusinessName()
        };
    }
}