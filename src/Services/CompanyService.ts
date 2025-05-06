import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CompanyDao } from 'src/Daos/CompanyDao';
import { StatusCodeEnums } from 'src/Enums/StatusCodeEnum';
import HttpCustomException from 'src/Exceptions/HttpCustomException';
import { Company } from 'src/Models/Entities/CompanyEntity';
import { CreateCompanyRequestDto } from 'src/Models/Request/CompanyController/CreateCompanyRequestDto';
import { CompanyResponseDto } from 'src/Models/Response/CompanyController/CompanyResponseDto';
import GenericResponse from 'src/Models/Response/GenericResponse';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CompanyService {
    private readonly _logger = new Logger(CompanyService.name);

    constructor(
        private readonly companyDao: CompanyDao,
        private readonly dataSource: DataSource
    ) { }

    /**
     * Creates a new company with validation and sanitization
     * @param data Company data to create
     * @returns Generic response with success message
    */
    async createCompany(data: CreateCompanyRequestDto): Promise<GenericResponse> {
        this._logger.log(`Starting company creation process for CUIT: ${data.cuit}`);
        if (!this._isValidCuit(data.cuit)) {
            throw new HttpCustomException(
                'Invalid CUIT format',
                StatusCodeEnums.COMPANY_NOT_FOUND,
                'Invalid Input',
                { cuit: 'CUIT must follow the correct format and checksum validation' }
            );
        }
        const formattedCuit = this._formatCuit(data.cuit);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const existingCompany = await this.companyDao.findByCuit(formattedCuit);
            if (existingCompany) {
                throw new ConflictException(`Company with CUIT ${formattedCuit} already exists`);
            }
            const newCompany = new Company();
            newCompany.setCuit(formattedCuit);
            newCompany.setBusinessName(this._sanitizeInput(data.businessName).trim());
            newCompany.setAdhesionDate(new Date());
            newCompany.setUuid(uuidv4());
            await this.companyDao.save(newCompany);
            await queryRunner.commitTransaction();
            this._logger.log(`Company created successfully: ${newCompany.getUuid()}`);
            return new GenericResponse('Company created successfully');
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this._logger.error(`Error creating company: ${error.message}`, error.stack);
            if (error instanceof ConflictException) {
                throw error;
            };
            throw new HttpCustomException(
                'Failed to create company',
                StatusCodeEnums.COMPANY_NOT_FOUND,
                'Database Error',
                { error: error.message }
            );
        } finally {
            await queryRunner.release();
        }
    }

    async findAll(page = 1, limit = 10): Promise<CompanyResponseDto[]> {
        this._logger.log(`Fetching all companies - page: ${page}, limit: ${limit}`);
        try {
            const skip = (page - 1) * limit;
            const companies: Company[] = await this.companyDao.findAll(skip, limit);

            if (!companies || companies.length === 0) {
                throw new HttpCustomException('No companies found', StatusCodeEnums.NOT_COMPANIES_FOUND);
            }

            return companies.map(company => new CompanyResponseDto(company));
        } catch (error) {
            this._logger.error(`Error finding all companies: ${error.message}`, error.stack);
            throw error;
        }
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

    /**
     * Validates a CUIT format and checksum
     * @param cuit CUIT to validate
     * @returns true if valid, false otherwise
    */
    private _isValidCuit(cuit: string): boolean {
        const cleanCuit = cuit.replace(/\D/g, '');
        if (!/^(20|23|24|25|26|27|30|33|34)\d{9}$/.test(cleanCuit)) {
            return false;
        }
        const digits = cleanCuit.split('').map(Number);
        const checksum = digits.pop();
        const sum = digits.reduce((acc, digit, index) => {
            return acc + digit * (2 + (digits.length - index - 1) % 9);
        }, 0);
        const calculatedChecksum = (11 - (sum % 11)) % 11;
        return calculatedChecksum === checksum;
    }

    /**
     * Formats a CUIT consistently (XX-XXXXXXXX-X)
     * @param cuit CUIT to format
     * @returns Formatted CUIT
    */
    private _formatCuit(cuit: string): string {
        const cleanCuit = cuit.replace(/\D/g, '');
        return `${cleanCuit.substring(0, 2)}-${cleanCuit.substring(2, 10)}-${cleanCuit.substring(10, 11)}`;
    }

    /**
     * Sanitizes input against XSS and SQL injection
     * @param input Input to sanitize
     * @returns Sanitized input
    */
    private _sanitizeInput(input: string): string {
        // Basic sanitization
        return input
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/'/g, '&#39;')
            .replace(/"/g, '&quot;')
            .replace(/;/g, '&#59;');
    }
}