import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CompanyController } from 'src/Controllers/CompanyController';
import { CompanyService } from 'src/Services/CompanyService';
import { CompanyResponseDto } from 'src/Models/Response/CompanyController/CompanyResponseDto';
import { CreateCompanyRequestDto } from 'src/Models/Request/CompanyController/CreateCompanyRequestDto';

describe('CompanyController', () => {
    let controller: CompanyController;
    let mockCompanyService: any;

    beforeEach(async () => {
        mockCompanyService = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findCompaniesAdheringLastMonth: jest.fn(),
            createCompany: jest.fn(),
        };

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
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all companies', async () => {
            const companies = [
                new CompanyResponseDto('1', '30123456780', 'Empresa A', new Date()),
                new CompanyResponseDto('2', '30123456781', 'Empresa B', new Date()),
            ];
            mockCompanyService.findAll.mockResolvedValue(companies);

            const result = await controller.findAll();
            expect(result).toHaveLength(2);
            expect(result[0].cuit).toBe('30123456780');
            expect(result[1].cuit).toBe('30123456781');
            expect(mockCompanyService.findAll).toHaveBeenCalled();
        });
    });

    describe('findById', () => {
        it('should return a company by id', async () => {
            const company = new CompanyResponseDto('1', '30123456780', 'Empresa A', new Date());
            mockCompanyService.findById.mockResolvedValue(company);

            const result = await controller.findById('1');
            expect(result).toBeDefined();
            expect(result.cuit).toBe('30123456780');
            expect(mockCompanyService.findById).toHaveBeenCalledWith('1');
        });

        it('should throw NotFoundException if company not found', async () => {
            mockCompanyService.findById.mockResolvedValue(null);

            await expect(controller.findById('999')).rejects.toThrow(NotFoundException);
            expect(mockCompanyService.findById).toHaveBeenCalledWith('999');
        });
    });

    describe('findCompaniesAdheringLastMonth', () => {
        it('should return companies adhering last month', async () => {
            const companies = [
                new CompanyResponseDto('1', '30123456780', 'Empresa A', new Date()),
                new CompanyResponseDto('2', '30123456781', 'Empresa B', new Date()),
            ];
            mockCompanyService.findCompaniesAdheringLastMonth.mockResolvedValue(companies);

            const result = await controller.findCompaniesAdheringLastMonth();
            expect(result).toHaveLength(2);
            expect(mockCompanyService.findCompaniesAdheringLastMonth).toHaveBeenCalled();
        });
    });

    describe('createCompany', () => {
        it('should create a new company', async () => {
            const createCompanyDto: CreateCompanyRequestDto = {
                cuit: '30123456780',
                businessName: 'Empresa A',
            };
            const createdCompany = new CompanyResponseDto('1', '30123456780', 'Empresa A', new Date());

            mockCompanyService.createCompany.mockResolvedValue(createdCompany);

            const result = await controller.createCompany(createCompanyDto);
            expect(result).toBeDefined();
            expect(result.cuit).toBe('30123456780');
            expect(result.businessName).toBe('Empresa A');
            expect(mockCompanyService.createCompany).toHaveBeenCalledWith(createCompanyDto);
        });
    });
});