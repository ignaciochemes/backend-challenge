import { Test, TestingModule } from '@nestjs/testing';
import { CompanyController } from 'src/Controllers/CompanyController';
import { StatusCodeEnums } from 'src/Enums/StatusCodeEnum';
import HttpCustomException from 'src/Exceptions/HttpCustomException';
import ResponseFormatter from 'src/Helpers/Formatter/ResponseFormatter';
import { CreateCompanyRequestDto } from 'src/Models/Request/CompanyController/CreateCompanyRequestDto';
import { CompanyResponseDto } from 'src/Models/Response/CompanyController/CompanyResponseDto';
import GenericResponse from 'src/Models/Response/GenericResponse';
import { CompanyService } from 'src/Services/CompanyService';

describe('CompanyController', () => {
    let controller: CompanyController;
    let service: CompanyService;

    const mockCompanyService = {
        createCompany: jest.fn(),
        findAll: jest.fn(),
        findById: jest.fn(),
        findCompaniesAdheringLastMonth: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CompanyController],
            providers: [
                {
                    provide: CompanyService,
                    useValue: mockCompanyService,
                },
            ],
        }).compile();

        controller = module.get<CompanyController>(CompanyController);
        service = module.get<CompanyService>(CompanyService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('createCompany', () => {
        it('should create a company successfully', async () => {
            const createCompanyDto: CreateCompanyRequestDto = {
                cuit: '30-71659554-9',
                businessName: 'Test Company',
                address: 'Test Address',
                contactEmail: 'test@example.com',
                contactPhone: '+541145678901',
            };
            const expectedResponse = new GenericResponse('Company created successfully');
            mockCompanyService.createCompany.mockResolvedValue(expectedResponse);
            const result = await controller.createCompany(createCompanyDto);
            expect(service.createCompany).toHaveBeenCalledWith(createCompanyDto);
            expect(result).toBeInstanceOf(ResponseFormatter);
            expect(result.result).toEqual(expectedResponse);
        });

        it('should handle errors when creating a company', async () => {
            const createCompanyDto: CreateCompanyRequestDto = {
                cuit: '30-71659554-9',
                businessName: 'Test Company',
                address: 'Test Address',
                contactEmail: 'test@example.com',
                contactPhone: '+541145678901',
            };
            mockCompanyService.createCompany.mockRejectedValue(
                new HttpCustomException(
                    'Failed to create company',
                    StatusCodeEnums.COMPANY_NOT_FOUND,
                    'Database Error',
                    { error: 'Database Error' }
                )
            );
            await expect(controller.createCompany(createCompanyDto)).rejects.toThrow(HttpCustomException);
        });
    });

    describe('findAll', () => {
        it('should return all companies', async () => {
            const page = 1;
            const limit = 10;
            const mockCompanies: CompanyResponseDto[] = [
                {
                    id: 1,
                    uuid: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
                    cuit: '30-71659554-9',
                    businessName: 'Test Company 1',
                    adhesionDate: new Date(),
                    address: 'Test Address 1',
                    contactEmail: 'test1@example.com',
                    contactPhone: '+541145678901',
                    isActive: true,
                    createdAt: new Date(),
                },
                {
                    id: 2,
                    uuid: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
                    cuit: '30-71123456-7',
                    businessName: 'Test Company 2',
                    adhesionDate: new Date(),
                    address: 'Test Address 2',
                    contactEmail: 'test2@example.com',
                    contactPhone: '+541123456789',
                    isActive: true,
                    createdAt: new Date(),
                },
            ];
            mockCompanyService.findAll.mockResolvedValue(mockCompanies);
            const result = await controller.findAll(page, limit);
            expect(service.findAll).toHaveBeenCalledWith();
            expect(result).toBeInstanceOf(ResponseFormatter);
            expect(result.result).toEqual(mockCompanies);
        });

        it('should handle errors when finding all companies', async () => {
            mockCompanyService.findAll.mockRejectedValue(
                new HttpCustomException('No companies found', StatusCodeEnums.NOT_COMPANIES_FOUND)
            );
            await expect(controller.findAll()).rejects.toThrow(HttpCustomException);
        });
    });

    describe('findById', () => {
        it('should return a company by ID', async () => {
            const companyId = '1';
            const mockCompany: CompanyResponseDto = {
                id: 1,
                uuid: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
                cuit: '30-71659554-9',
                businessName: 'Test Company',
                adhesionDate: new Date(),
                address: 'Test Address',
                contactEmail: 'test@example.com',
                contactPhone: '+541145678901',
                isActive: true,
                createdAt: new Date(),
            };
            mockCompanyService.findById.mockResolvedValue(mockCompany);
            const result = await controller.findById(companyId);
            expect(service.findById).toHaveBeenCalledWith(companyId);
            expect(result).toBeInstanceOf(ResponseFormatter);
            expect(result.result).toEqual(mockCompany);
        });

        it('should handle errors when finding a company by ID', async () => {
            const companyId = '999';
            mockCompanyService.findById.mockRejectedValue(
                new HttpCustomException('Company not found', StatusCodeEnums.COMPANY_NOT_FOUND)
            );
            await expect(controller.findById(companyId)).rejects.toThrow(HttpCustomException);
        });
    });

    describe('findCompaniesAdheringLastMonth', () => {
        it('should return companies that adhered in the last month', async () => {
            const mockCompanies: CompanyResponseDto[] = [
                {
                    id: 1,
                    uuid: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
                    cuit: '30-71659554-9',
                    businessName: 'Test Company 1',
                    adhesionDate: new Date(),
                    address: 'Test Address 1',
                    contactEmail: 'test1@example.com',
                    contactPhone: '+541145678901',
                    isActive: true,
                    createdAt: new Date(),
                },
                {
                    id: 2,
                    uuid: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
                    cuit: '30-71123456-7',
                    businessName: 'Test Company 2',
                    adhesionDate: new Date(),
                    address: 'Test Address 2',
                    contactEmail: 'test2@example.com',
                    contactPhone: '+541123456789',
                    isActive: true,
                    createdAt: new Date(),
                },
            ];
            mockCompanyService.findCompaniesAdheringLastMonth.mockResolvedValue(mockCompanies);
            const result = await controller.findCompaniesAdheringLastMonth();
            expect(service.findCompaniesAdheringLastMonth).toHaveBeenCalled();
            expect(result).toBeInstanceOf(ResponseFormatter);
            expect(result.result).toEqual(mockCompanies);
        });

        it('should handle errors when finding companies adhering last month', async () => {
            mockCompanyService.findCompaniesAdheringLastMonth.mockRejectedValue(
                new HttpCustomException('No companies found adhering last month', StatusCodeEnums.NOT_COMPANIES_FOUND)
            );
            await expect(controller.findCompaniesAdheringLastMonth()).rejects.toThrow(HttpCustomException);
        });
    });
});