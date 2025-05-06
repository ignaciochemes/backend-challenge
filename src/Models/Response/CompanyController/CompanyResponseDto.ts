import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Company } from "src/Models/Entities/CompanyEntity";

@ApiSchema({ name: 'CompanyResponseDto' })
export class CompanyResponseDto {
    @ApiProperty({ description: 'Company ID', example: 1 })
    id: number;

    @ApiProperty({ description: 'Company UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
    uuid: string;

    @ApiProperty({ description: 'Company CUIT', example: '20-12345678-9' })
    cuit: string;

    @ApiProperty({ description: 'Company business name', example: 'My Company' })
    businessName: string;

    @ApiProperty({ description: 'Company adhesion date', example: '2023-01-01T00:00:00Z' })
    adhesionDate: Date;

    @ApiProperty({ description: 'Company address', example: '123 Main St' })
    address?: string;

    @ApiProperty({ description: 'Company contact email', example: 'example@example.com' })
    contactEmail?: string;

    @ApiProperty({ description: 'Company contact phone', example: '+54123456789' })
    contactPhone?: string;

    @ApiProperty({ description: 'Company active status', example: true })
    isActive: boolean;

    @ApiProperty({ description: 'Company creation date', example: '2023-01-01T00:00:00Z' })
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