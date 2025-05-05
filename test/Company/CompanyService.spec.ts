import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CompanyService } from 'src/Services/CompanyService';
import { CompanyDao } from 'src/Daos/CompanyDao';
import { CreateCompanyRequestDto } from 'src/Models/Request/CompanyController/CreateCompanyRequestDto';

describe('CompanyService', () => {
    let service: CompanyService;
    let mockCompanyDao: any;

    beforeEach(async () => {
        mockCompanyDao = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByCuit: jest.fn(),
            findCompaniesAdheringLastMonth: jest.fn(),
            save: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CompanyService,
                {
                    provide: CompanyDao,
                    useValue: mockCompanyDao,
                },
            ],
        }).compile();

        service = module.get<CompanyService>(CompanyService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all companies', async () => {
            const companies = [
                { id: '1', cuit: '30123456780', businessName: 'Empresa A', adhesionDate: new Date() },
                { id: '2', cuit: '30123456781', businessName: 'Empresa B', adhesionDate: new Date() },
            ];
            mockCompanyDao.findAll.mockResolvedValue(companies);

            const result = await service.findAll();
            expect(result).toHaveLength(2);
            expect(result[0].cuit).toBe('30123456780');
            expect(result[1].cuit).toBe('30123456781');
            expect(mockCompanyDao.findAll).toHaveBeenCalled();
        });
    });

    describe('findById', () => {
        it('should return a company by id', async () => {
            const company = { id: '1', cuit: '30123456780', businessName: 'Empresa A', adhesionDate: new Date() };
            mockCompanyDao.findById.mockResolvedValue(company);

            const result = await service.findById('1');
            expect(result).toBeDefined();
            expect(result?.cuit).toBe('30123456780');
            expect(mockCompanyDao.findById).toHaveBeenCalledWith('1');
        });

        it('should return null if company not found', async () => {
            mockCompanyDao.findById.mockResolvedValue(null);

            const result = await service.findById('999');
            expect(result).toBeNull();
            expect(mockCompanyDao.findById).toHaveBeenCalledWith('999');
        });
    });

    describe('findCompaniesAdheringLastMonth', () => {
        it('should return companies adhering last month', async () => {
            const companies = [
                { id: '1', cuit: '30123456780', businessName: 'Empresa A', adhesionDate: new Date() },
                { id: '2', cuit: '30123456781', businessName: 'Empresa B', adhesionDate: new Date() },
            ];
            mockCompanyDao.findCompaniesAdheringLastMonth.mockResolvedValue(companies);

            const result = await service.findCompaniesAdheringLastMonth();
            expect(result).toHaveLength(2);
            expect(mockCompanyDao.findCompaniesAdheringLastMonth).toHaveBeenCalled();
        });
    });

    describe('createCompany', () => {
        it('should create a new company', async () => {
            const createCompanyDto: CreateCompanyRequestDto = {
                cuit: '30123456780',
                businessName: 'Empresa A',
            };
            mockCompanyDao.findByCuit.mockResolvedValue(null);
            mockCompanyDao.save.mockImplementation(company => ({
                ...company,
                id: '1',
            }));

            const result = await service.createCompany(createCompanyDto);
            expect(result).toBeDefined();
            expect(result.cuit).toBe('30123456780');
            expect(result.businessName).toBe('Empresa A');
            expect(mockCompanyDao.findByCuit).toHaveBeenCalledWith('30123456780');
            expect(mockCompanyDao.save).toHaveBeenCalled();
        });

        it('should throw ConflictException if company with cuit already exists', async () => {
            const createCompanyDto: CreateCompanyRequestDto = {
                cuit: '30123456780',
                businessName: 'Empresa A',
            };
            const existingCompany = { id: '1', cuit: '30123456780', businessName: 'Empresa Existente', adhesionDate: new Date() };
            mockCompanyDao.findByCuit.mockResolvedValue(existingCompany);

            await expect(service.createCompany(createCompanyDto)).rejects.toThrow(ConflictException);
            expect(mockCompanyDao.findByCuit).toHaveBeenCalledWith('30123456780');
            expect(mockCompanyDao.save).not.toHaveBeenCalled();
        });
    });
});