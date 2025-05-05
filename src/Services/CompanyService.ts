import { Injectable, ConflictException } from '@nestjs/common';
import { CompanyDao } from 'src/Daos/CompanyDao';
import { StatusCodeEnums } from 'src/Enums/StatusCodeEnum';
import HttpCustomException from 'src/Exceptions/HttpCustomException';
import { Company } from 'src/Models/Entities/CompanyEntity';
import { CreateCompanyRequestDto } from 'src/Models/Request/CompanyController/CreateCompanyRequestDto';
import { CompanyResponseDto } from 'src/Models/Response/CompanyController/CompanyResponseDto';
import GenericResponse from 'src/Models/Response/GenericResponse';

@Injectable()
export class CompanyService {
    constructor(private readonly companyDao: CompanyDao) { }

    async createCompany(data: CreateCompanyRequestDto): Promise<GenericResponse> {
        const existingCompany = await this.companyDao.findByCuit(data.cuit);
        if (existingCompany) {
            throw new ConflictException(`Company with CUIT ${data.cuit} already exists`);
        }
        const newCompany = new Company();
        newCompany.setCuit(data.cuit);
        newCompany.setBusinessName(data.businessName);
        newCompany.setAdhesionDate(new Date());
        await this.companyDao.save(newCompany);
        return new GenericResponse('Company created successfully');
    }

    async findAll(): Promise<CompanyResponseDto[]> {
        const companies: Company[] = await this.companyDao.findAll();
        if (!companies || companies.length === 0) {
            throw new HttpCustomException('No companies found', StatusCodeEnums.NOT_COMPANIES_FOUND);
        }
        let response: CompanyResponseDto[] = [];
        response = companies.map(company => {
            return new CompanyResponseDto(company);
        });
        return response;
    }

    async findById(id: string): Promise<CompanyResponseDto | null> {
        const company: Company = await this.companyDao.findById(id);
        if (!company) {
            throw new HttpCustomException('Company not found', StatusCodeEnums.COMPANY_NOT_FOUND);
        }
        return new CompanyResponseDto(company);
    }

    async findCompaniesAdheringLastMonth(): Promise<CompanyResponseDto[]> {
        const companies: Company[] = await this.companyDao.findCompaniesAdheringLastMonth();
        if (!companies || companies.length === 0) {
            throw new HttpCustomException('No companies found adhering last month', StatusCodeEnums.NOT_COMPANIES_FOUND);
        }
        let response: CompanyResponseDto[] = [];
        response = companies.map(company => {
            return new CompanyResponseDto(company);
        });
        return response;
    }
}