import { Test, TestingModule } from '@nestjs/testing';
import { TransferService } from '../../src/Services/TransferService';
import { TransferDao } from '../../src/Daos/TransferDao';
import { CompanyDao } from '../../src/Daos/CompanyDao';
import { CreateTransferRequestDto } from '../../src/Models/Request/TransferController/CreateTransferRequestDto';
import { Transfer } from '../../src/Models/Entities/TransferEntity';
import { Company } from '../../src/Models/Entities/CompanyEntity';
import { TransferResponseDto } from '../../src/Models/Response/TransferController/TransferResponseDto';
import { FindTransferQueryRequest } from '../../src/Models/Request/TransferController/FindTransferQueryRequest';
import { PaginatedResponseDto } from '../../src/Models/Response/PaginatedResponseDto';
import { DataSource, QueryRunner } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import HttpCustomException from '../../src/Exceptions/HttpCustomException';
import { TransferStatus } from '../../src/Enums/TransferStatusEnum';

jest.mock('uuid', () => ({
    v4: jest.fn().mockReturnValue('mocked-uuid-value'),
}));

describe('TransferService', () => {
    let service: TransferService;
    let transferDao: TransferDao;
    let companyDao: CompanyDao;
    let dataSource: DataSource;
    let queryRunner: QueryRunner;

    const mockTransferDao = {
        save: jest.fn(),
        findAll: jest.fn(),
        findById: jest.fn(),
        findByCompanyId: jest.fn(),
        findCompaniesWithTransfersLastMonth: jest.fn(),
        count: jest.fn(),
    };

    const mockCompanyDao = {
        findById: jest.fn(),
        findByIds: jest.fn(),
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
                TransferService,
                {
                    provide: TransferDao,
                    useValue: mockTransferDao,
                },
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

        service = module.get<TransferService>(TransferService);
        transferDao = module.get<TransferDao>(TransferDao);
        companyDao = module.get<CompanyDao>(CompanyDao);
        dataSource = module.get<DataSource>(DataSource);
        queryRunner = dataSource.createQueryRunner();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createTransfer', () => {
        it('should create a transfer successfully', async () => {
            const createTransferDto: CreateTransferRequestDto = {
                amount: 1000,
                companyId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
                debitAccount: '123456789012',
                creditAccount: '987654321012',
                description: 'Test transfer',
                referenceId: 'REF-TEST-001',
                status: TransferStatus.PENDING,
                currency: 'ARS',
            };
            const mockCompany = new Company();
            mockCompany.id = 1;
            mockCompany.setUuid = jest.fn();
            mockCompany.getUuid = jest.fn().mockReturnValue('f47ac10b-58cc-4372-a567-0e02b2c3d479');
            mockCompany.setBusinessName = jest.fn();
            mockCompany.getBusinessName = jest.fn().mockReturnValue('Test Company');
            mockCompanyDao.findById.mockResolvedValue(mockCompany);
            mockTransferDao.save.mockImplementation((transfer) => Promise.resolve(transfer));
            const result = await service.createTransfer(createTransferDto);
            expect(queryRunner.connect).toHaveBeenCalled();
            expect(queryRunner.startTransaction).toHaveBeenCalled();
            expect(companyDao.findById).toHaveBeenCalledWith(createTransferDto.companyId);
            expect(transferDao.save).toHaveBeenCalled();
            expect(queryRunner.commitTransaction).toHaveBeenCalled();
            expect(queryRunner.release).toHaveBeenCalled();
            expect(result.message).toBe('Transfer created successfully');
        });

        it('should throw exception when company not found', async () => {
            const createTransferDto: CreateTransferRequestDto = {
                amount: 1000,
                companyId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
                debitAccount: '123456789012',
                creditAccount: '987654321012',
            };
            mockCompanyDao.findById.mockResolvedValue(null);
            await expect(service.createTransfer(createTransferDto)).rejects.toThrow(NotFoundException);
            expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
            expect(queryRunner.release).toHaveBeenCalled();
        });

        it('should throw exception when amount is negative', async () => {
            const createTransferDto: CreateTransferRequestDto = {
                amount: -100,
                companyId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
                debitAccount: '123456789012',
                creditAccount: '987654321012',
            };
            await expect(service.createTransfer(createTransferDto)).rejects.toThrow(BadRequestException);
        });

        it('should throw exception when debit and credit accounts are the same', async () => {
            const createTransferDto: CreateTransferRequestDto = {
                amount: 1000,
                companyId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
                debitAccount: '123456789012',
                creditAccount: '123456789012',
            };
            await expect(service.createTransfer(createTransferDto)).rejects.toThrow(BadRequestException);
        });

        it('should handle other errors and roll back transaction', async () => {
            const createTransferDto: CreateTransferRequestDto = {
                amount: 1000,
                companyId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
                debitAccount: '123456789012',
                creditAccount: '987654321012',
            };
            const mockCompany = new Company();
            mockCompany.id = 1;
            mockCompany.setUuid = jest.fn();
            mockCompany.getUuid = jest.fn().mockReturnValue('f47ac10b-58cc-4372-a567-0e02b2c3d479');
            mockCompanyDao.findById.mockResolvedValue(mockCompany);
            mockTransferDao.save.mockRejectedValue(new Error('Database error'));
            await expect(service.createTransfer(createTransferDto)).rejects.toThrow(HttpCustomException);
            expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
            expect(queryRunner.release).toHaveBeenCalled();
        });
    });

    describe('findAll', () => {
        it('should return all transfers with pagination', async () => {
            const query: FindTransferQueryRequest = {
                page: 0,
                limit: 10,
            };
            const mockTransfers = [
                createMockTransfer(1),
                createMockTransfer(2),
            ];
            mockTransferDao.findAll.mockResolvedValue([mockTransfers, 2]);
            const result = await service.findAll(query);
            expect(transferDao.findAll).toHaveBeenCalledWith(0, 10);
            expect(result).toBeInstanceOf(PaginatedResponseDto);
            expect(result.data.length).toBe(2);
            expect(result.data[0]).toBeInstanceOf(TransferResponseDto);
            expect(result.pagination.totalItems).toBe(2);
        });

        it('should throw exception when no transfers found', async () => {
            const query: FindTransferQueryRequest = {
                page: 0,
                limit: 10,
            };
            mockTransferDao.findAll.mockResolvedValue([[], 0]);
            await expect(service.findAll(query)).rejects.toThrow(HttpCustomException);
            expect(transferDao.findAll).toHaveBeenCalled();
        });
    });

    describe('findById', () => {
        it('should return a transfer by ID', async () => {
            const transferId = '1';
            const mockTransfer = createMockTransfer(1);
            mockTransferDao.findById.mockResolvedValue(mockTransfer);
            const result = await service.findById(transferId);
            expect(transferDao.findById).toHaveBeenCalledWith(transferId);
            expect(result).toBeInstanceOf(TransferResponseDto);
            expect(result.id).toBe(1);
        });

        it('should throw exception when transfer not found', async () => {
            const transferId = '999';
            mockTransferDao.findById.mockResolvedValue(null);
            await expect(service.findById(transferId)).rejects.toThrow(HttpCustomException);
            expect(transferDao.findById).toHaveBeenCalledWith(transferId);
        });

        it('should throw exception with invalid ID format', async () => {
            const invalidId = 'invalid-id';
            await expect(service.findById(invalidId)).rejects.toThrow(HttpCustomException);
        });
    });

    describe('findByCompanyId', () => {
        it('should return transfers by company ID', async () => {
            const companyId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
            const mockCompany = new Company();
            mockCompany.id = 1;
            mockCompany.setUuid = jest.fn();
            mockCompany.getUuid = jest.fn().mockReturnValue(companyId);
            const mockTransfers = [
                createMockTransfer(1),
                createMockTransfer(2),
            ];
            mockCompanyDao.findById.mockResolvedValue(mockCompany);
            mockTransferDao.findByCompanyId.mockResolvedValue(mockTransfers);
            const result = await service.findByCompanyId(companyId);
            expect(companyDao.findById).toHaveBeenCalledWith(companyId);
            expect(transferDao.findByCompanyId).toHaveBeenCalledWith(companyId);
            expect(result.length).toBe(2);
            expect(result[0]).toBeInstanceOf(TransferResponseDto);
        });

        it('should throw exception when company not found', async () => {
            const companyId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
            mockCompanyDao.findById.mockResolvedValue(null);
            await expect(service.findByCompanyId(companyId)).rejects.toThrow(HttpCustomException);
            expect(companyDao.findById).toHaveBeenCalledWith(companyId);
        });

        it('should throw exception when no transfers found for company', async () => {
            const companyId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
            const mockCompany = new Company();
            mockCompany.id = 1;
            mockCompany.setUuid = jest.fn();
            mockCompany.getUuid = jest.fn().mockReturnValue(companyId);
            mockCompanyDao.findById.mockResolvedValue(mockCompany);
            mockTransferDao.findByCompanyId.mockResolvedValue([]);
            await expect(service.findByCompanyId(companyId)).rejects.toThrow(HttpCustomException);
            expect(companyDao.findById).toHaveBeenCalledWith(companyId);
            expect(transferDao.findByCompanyId).toHaveBeenCalledWith(companyId);
        });
    });

    describe('findCompaniesWithTransfersLastMonth', () => {
        it('should return companies with transfers in the last month', async () => {
            const companyIds = ['uuid1', 'uuid2'];
            const mockCompanies = [
                createMockCompany(1, 'uuid1', '30-71659554-9', 'Company 1'),
                createMockCompany(2, 'uuid2', '30-71123456-7', 'Company 2'),
            ];
            mockTransferDao.findCompaniesWithTransfersLastMonth.mockResolvedValue(companyIds);
            mockCompanyDao.findById.mockImplementation((id) => {
                return Promise.resolve(mockCompanies.find(c => c.getUuid() === id) || null);
            });
            const result = await service.findCompaniesWithTransfersLastMonth();
            expect(transferDao.findCompaniesWithTransfersLastMonth).toHaveBeenCalled();
            expect(result.length).toBe(2);
        });

        it('should throw exception when no companies found with transfers last month', async () => {
            mockTransferDao.findCompaniesWithTransfersLastMonth.mockResolvedValue([]);
            await expect(service.findCompaniesWithTransfersLastMonth()).rejects.toThrow(HttpCustomException);
            expect(transferDao.findCompaniesWithTransfersLastMonth).toHaveBeenCalled();
        });
    });

    function createMockTransfer(id: number): Transfer {
        const transfer = new Transfer();
        transfer.id = id;
        transfer.createdAt = new Date();
        transfer.updatedAt = new Date();
        transfer.setUuid = jest.fn();
        transfer.getUuid = jest.fn().mockReturnValue(`uuid-${id}`);
        transfer.setAmount = jest.fn();
        transfer.getAmount = jest.fn().mockReturnValue(1000 * id);

        const company = new Company();
        company.id = 1;
        company.setUuid = jest.fn();
        company.getUuid = jest.fn().mockReturnValue('f47ac10b-58cc-4372-a567-0e02b2c3d479');
        company.setCuit = jest.fn();
        company.getCuit = jest.fn().mockReturnValue('30-71659554-9');
        company.setBusinessName = jest.fn();
        company.getBusinessName = jest.fn().mockReturnValue('Test Company');

        transfer.setCompanyId = jest.fn();
        transfer.getCompanyId = jest.fn().mockReturnValue(company);
        transfer.setDebitAccount = jest.fn();
        transfer.getDebitAccount = jest.fn().mockReturnValue('123456789012');
        transfer.setCreditAccount = jest.fn();
        transfer.getCreditAccount = jest.fn().mockReturnValue('987654321012');
        transfer.setTransferDate = jest.fn();
        transfer.getTransferDate = jest.fn().mockReturnValue(new Date());
        transfer.setStatus = jest.fn();
        transfer.getStatus = jest.fn().mockReturnValue(TransferStatus.COMPLETED);
        transfer.setDescription = jest.fn();
        transfer.getDescription = jest.fn().mockReturnValue(`Test transfer ${id}`);
        transfer.setReferenceId = jest.fn();
        transfer.getReferenceId = jest.fn().mockReturnValue(`REF-TEST-00${id}`);
        transfer.setProcessedDate = jest.fn();
        transfer.getProcessedDate = jest.fn().mockReturnValue(new Date());
        transfer.setCurrency = jest.fn();
        transfer.getCurrency = jest.fn().mockReturnValue('ARS');

        return transfer;
    }

    function createMockCompany(id: number, uuid: string, cuit: string, businessName: string): Company {
        const company = new Company();
        company.id = id;
        company.createdAt = new Date();
        company.updatedAt = new Date();
        company.setUuid = jest.fn();
        company.getUuid = jest.fn().mockReturnValue(uuid);
        company.setCuit = jest.fn();
        company.getCuit = jest.fn().mockReturnValue(cuit);
        company.setBusinessName = jest.fn();
        company.getBusinessName = jest.fn().mockReturnValue(businessName);
        company.setAdhesionDate = jest.fn();
        company.getAdhesionDate = jest.fn().mockReturnValue(new Date());
        company.setIsActive = jest.fn();
        company.isIsActive = jest.fn().mockReturnValue(true);
        company.getAddress = jest.fn().mockReturnValue('Test Address');
        company.getContactEmail = jest.fn().mockReturnValue('test@example.com');
        company.getContactPhone = jest.fn().mockReturnValue('+541145678901');
        return company;
    }
});