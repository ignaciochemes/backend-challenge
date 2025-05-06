import { Test, TestingModule } from '@nestjs/testing';
import { CompanyService } from '../../src/Services/CompanyService';
import { CompanyDao } from '../../src/Daos/CompanyDao';
import { CreateCompanyRequestDto } from '../../src/Models/Request/CompanyController/CreateCompanyRequestDto';
import { Company } from '../../src/Models/Entities/CompanyEntity';
import { CompanyResponseDto } from '../../src/Models/Response/CompanyController/CompanyResponseDto';
import { DataSource, QueryRunner } from 'typeorm';
import { ConflictException } from '@nestjs/common';
import HttpCustomException from '../../src/Exceptions/HttpCustomException';

jest.mock('uuid', () => ({
    v4: jest.fn().mockReturnValue('mocked-uuid-value'),
}));

describe('CompanyService', () => {
    let service: CompanyService;
    let companyDao: CompanyDao;
    let dataSource: DataSource;
    let queryRunner: QueryRunner;

    const mockCompanyDao = {
        save: jest.fn(),
        findAll: jest.fn(),
        findById: jest.fn(),
        findByCuit: jest.fn(),
        findCompaniesAdheringLastMonth: jest.fn(),
        count: jest.fn(),
    };

    const mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
    };

    const mockDataSource = {
        createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CompanyService,
                {
                    provide: CompanyDao,
                    useValue: mockCompanyDao,
                },
                {
                    provide: DataSource,
                    useValue: mockDataSource,
                },
            ],
        }).compile();

        service = module.get<CompanyService>(CompanyService);
        companyDao = module.get<CompanyDao>(CompanyDao);
        dataSource = module.get<DataSource>(DataSource);
        queryRunner = dataSource.createQueryRunner();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
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
            mockCompanyDao.findByCuit.mockResolvedValue(null);
            mockCompanyDao.save.mockImplementation((company) => Promise.resolve(company));
            const result = await service.createCompany(createCompanyDto);
            expect(queryRunner.connect).toHaveBeenCalled();
            expect(queryRunner.startTransaction).toHaveBeenCalled();
            expect(companyDao.findByCuit).toHaveBeenCalledWith('30-71659554-9');
            expect(companyDao.save).toHaveBeenCalled();
            expect(queryRunner.commitTransaction).toHaveBeenCalled();
            expect(queryRunner.release).toHaveBeenCalled();
            expect(result.message).toBe('Company created successfully');
        });

        it('should format CUIT correctly', async () => {
            const createCompanyDto: CreateCompanyRequestDto = {
                cuit: '30716595549',
                businessName: 'Test Company',
            };
            mockCompanyDao.findByCuit.mockResolvedValue(null);
            mockCompanyDao.save.mockImplementation((company) => Promise.resolve(company));
            await service.createCompany(createCompanyDto);
            expect(companyDao.findByCuit).toHaveBeenCalledWith('30-71659554-9');
        });

        it('should throw conflict exception if company with CUIT already exists', async () => {
            const createCompanyDto: CreateCompanyRequestDto = {
                cuit: '30-71659554-9',
                businessName: 'Test Company',
            };
            const existingCompany = new Company();
            mockCompanyDao.findByCuit.mockResolvedValue(existingCompany);
            await expect(service.createCompany(createCompanyDto)).rejects.toThrow(ConflictException);
            expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
            expect(queryRunner.release).toHaveBeenCalled();
        });

        it('should handle other errors and roll back transaction', async () => {
            const createCompanyDto: CreateCompanyRequestDto = {
                cuit: '30-71659554-9',
                businessName: 'Test Company',
            };
            mockCompanyDao.findByCuit.mockResolvedValue(null);
            mockCompanyDao.save.mockRejectedValue(new Error('Database error'));
            await expect(service.createCompany(createCompanyDto)).rejects.toThrow(HttpCustomException);
            expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
            expect(queryRunner.release).toHaveBeenCalled();
        });
    });

    describe('findAll', () => {
        it('should return all companies', async () => {
            const page = 1;
            const limit = 10;
            const skip = (page - 1) * limit;
            const mockCompanies = [
                createMockCompany(1, 'uuid1', '30-71659554-9', 'Company 1'),
                createMockCompany(2, 'uuid2', '30-71123456-7', 'Company 2'),
            ];
            mockCompanyDao.findAll.mockResolvedValue(mockCompanies);
            const result = await service.findAll(page, limit);
            expect(companyDao.findAll).toHaveBeenCalledWith(skip, limit);
            expect(result.length).toBe(2);
            expect(result[0]).toBeInstanceOf(CompanyResponseDto);
            expect(result[0].id).toBe(1);
            expect(result[1].id).toBe(2);
        });

        it('should throw exception when no companies found', async () => {
            mockCompanyDao.findAll.mockResolvedValue([]);
            await expect(service.findAll()).rejects.toThrow(HttpCustomException);
            expect(companyDao.findAll).toHaveBeenCalled();
        });
    });

    describe('findById', () => {
        it('should return a company by ID', async () => {
            const companyId = '1';
            const mockCompany = createMockCompany(1, 'uuid1', '30-71659554-9', 'Test Company');
            mockCompanyDao.findById.mockResolvedValue(mockCompany);
            const result = await service.findById(companyId);
            expect(companyDao.findById).toHaveBeenCalledWith(companyId);
            expect(result).toBeInstanceOf(CompanyResponseDto);
            expect(result.id).toBe(1);
            expect(result.businessName).toBe('Test Company');
        });

        it('should throw exception when company not found', async () => {
            const companyId = '999';
            mockCompanyDao.findById.mockResolvedValue(null);
            await expect(service.findById(companyId)).rejects.toThrow(HttpCustomException);
            expect(companyDao.findById).toHaveBeenCalledWith(companyId);
        });
    });

    describe('findCompaniesAdheringLastMonth', () => {
        it('should return companies that adhered in the last month', async () => {
            const mockCompanies = [
                createMockCompany(1, 'uuid1', '30-71659554-9', 'Company 1'),
                createMockCompany(2, 'uuid2', '30-71123456-7', 'Company 2'),
            ];
            mockCompanyDao.findCompaniesAdheringLastMonth.mockResolvedValue(mockCompanies);
            const result = await service.findCompaniesAdheringLastMonth();
            expect(companyDao.findCompaniesAdheringLastMonth).toHaveBeenCalled();
            expect(result.length).toBe(2);
            expect(result[0]).toBeInstanceOf(CompanyResponseDto);
            expect(result[0].id).toBe(1);
            expect(result[1].id).toBe(2);
        });

        it('should throw exception when no companies adhered last month', async () => {
            mockCompanyDao.findCompaniesAdheringLastMonth.mockResolvedValue([]);
            await expect(service.findCompaniesAdheringLastMonth()).rejects.toThrow(HttpCustomException);
            expect(companyDao.findCompaniesAdheringLastMonth).toHaveBeenCalled();
        });
    });

    function createMockCompany(id: number, uuid: string, cuit: string, businessName: string): Company {
        const company = new Company();
        company.id = id;
        company.createdAt = new Date();
        company.updatedAt = new Date();
        company.setUuid = jest.fn().mockReturnValue(undefined);
        company.getUuid = jest.fn().mockReturnValue(uuid);
        company.setCuit = jest.fn().mockReturnValue(undefined);
        company.getCuit = jest.fn().mockReturnValue(cuit);
        company.setBusinessName = jest.fn().mockReturnValue(undefined);
        company.getBusinessName = jest.fn().mockReturnValue(businessName);
        company.setAdhesionDate = jest.fn().mockReturnValue(undefined);
        company.getAdhesionDate = jest.fn().mockReturnValue(new Date());
        company.setIsActive = jest.fn().mockReturnValue(undefined);
        company.isIsActive = jest.fn().mockReturnValue(true);
        company.getAddress = jest.fn().mockReturnValue('Test Address');
        company.getContactEmail = jest.fn().mockReturnValue('test@example.com');
        company.getContactPhone = jest.fn().mockReturnValue('+541145678901');
        return company;
    }
});