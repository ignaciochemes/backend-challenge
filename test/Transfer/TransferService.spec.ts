import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TransferService } from 'src/Services/TransferService';
import { TransferDao } from 'src/Daos/TransferDao';
import { CompanyService } from 'src/Services/CompanyService';
import { CompanyResponseDto } from 'src/Models/Response/CompanyController/CompanyResponseDto';
import { CreateTransferRequestDto } from 'src/Models/Request/TransferController/CreateTransferRequestDto';

describe('TransferService', () => {
    let service: TransferService;
    let mockTransferDao: any;
    let mockCompanyService: any;

    beforeEach(async () => {
        mockTransferDao = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByCompanyId: jest.fn(),
            findCompaniesWithTransfersLastMonth: jest.fn(),
            save: jest.fn(),
        };

        mockCompanyService = {
            findById: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TransferService,
                {
                    provide: TransferDao,
                    useValue: mockTransferDao,
                },
                {
                    provide: CompanyService,
                    useValue: mockCompanyService,
                },
            ],
        }).compile();

        service = module.get<TransferService>(TransferService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all transfers', async () => {
            const transfers = [
                { id: '1', amount: 1000, companyId: '1', debitAccount: '123456', creditAccount: '654321', transferDate: new Date() },
                { id: '2', amount: 2000, companyId: '2', debitAccount: '123456', creditAccount: '654321', transferDate: new Date() },
            ];
            mockTransferDao.findAll.mockResolvedValue(transfers);

            const result = await service.findAll();
            expect(result).toHaveLength(2);
            expect(result[0].amount).toBe(1000);
            expect(result[1].amount).toBe(2000);
            expect(mockTransferDao.findAll).toHaveBeenCalled();
        });
    });

    describe('findById', () => {
        it('should return a transfer by id', async () => {
            const transfer = { id: '1', amount: 1000, companyId: '1', debitAccount: '123456', creditAccount: '654321', transferDate: new Date() };
            mockTransferDao.findById.mockResolvedValue(transfer);

            const result = await service.findById('1');
            expect(result).toBeDefined();
            expect(result?.amount).toBe(1000);
            expect(mockTransferDao.findById).toHaveBeenCalledWith('1');
        });

        it('should return null if transfer not found', async () => {
            mockTransferDao.findById.mockResolvedValue(null);

            const result = await service.findById('999');
            expect(result).toBeNull();
            expect(mockTransferDao.findById).toHaveBeenCalledWith('999');
        });
    });

    describe('findByCompanyId', () => {
        it('should return transfers by company id', async () => {
            const transfers = [
                { id: '1', amount: 1000, companyId: '1', debitAccount: '123456', creditAccount: '654321', transferDate: new Date() },
                { id: '2', amount: 2000, companyId: '1', debitAccount: '123456', creditAccount: '654321', transferDate: new Date() },
            ];
            mockTransferDao.findByCompanyId.mockResolvedValue(transfers);

            const result = await service.findByCompanyId('1');
            expect(result).toHaveLength(2);
            expect(result[0].companyId).toBe('1');
            expect(result[1].companyId).toBe('1');
            expect(mockTransferDao.findByCompanyId).toHaveBeenCalledWith('1');
        });
    });

    describe('findCompaniesWithTransfersLastMonth', () => {
        it('should return companies with transfers last month', async () => {
            mockTransferDao.findCompaniesWithTransfersLastMonth.mockResolvedValue(['1', '2']);
            const company1 = new CompanyResponseDto('1', '30123456780', 'Empresa A', new Date());
            const company2 = new CompanyResponseDto('2', '30123456781', 'Empresa B', new Date());

            mockCompanyService.findById.mockImplementation((id) => {
                if (id === '1') return Promise.resolve(company1);
                if (id === '2') return Promise.resolve(company2);
                return Promise.resolve(null);
            });

            const result = await service.findCompaniesWithTransfersLastMonth();
            expect(result).toHaveLength(2);
            expect(result[0].id).toBe('1');
            expect(result[1].id).toBe('2');
            expect(mockTransferDao.findCompaniesWithTransfersLastMonth).toHaveBeenCalled();
            expect(mockCompanyService.findById).toHaveBeenCalledTimes(2);
        });
    });

    describe('createTransfer', () => {
        it('should create a new transfer', async () => {
            const createTransferDto: CreateTransferRequestDto = {
                amount: 1000,
                companyId: '1',
                debitAccount: '123456',
                creditAccount: '654321',
            };

            const company = new CompanyResponseDto('1', '30123456780', 'Empresa A', new Date());
            mockCompanyService.findById.mockResolvedValue(company);

            mockTransferDao.save.mockImplementation(transfer => ({
                ...transfer,
                id: '1',
            }));

            const result = await service.createTransfer(createTransferDto);
            expect(result).toBeDefined();
            expect(result.amount).toBe(1000);
            expect(result.companyId).toBe('1');
            expect(mockCompanyService.findById).toHaveBeenCalledWith('1');
            expect(mockTransferDao.save).toHaveBeenCalled();
        });

        it('should throw NotFoundException if company not found', async () => {
            const createTransferDto: CreateTransferRequestDto = {
                amount: 1000,
                companyId: '999',
                debitAccount: '123456',
                creditAccount: '654321',
            };

            mockCompanyService.findById.mockResolvedValue(null);

            await expect(service.createTransfer(createTransferDto)).rejects.toThrow(NotFoundException);
            expect(mockCompanyService.findById).toHaveBeenCalledWith('999');
            expect(mockTransferDao.save).not.toHaveBeenCalled();
        });
    });
});