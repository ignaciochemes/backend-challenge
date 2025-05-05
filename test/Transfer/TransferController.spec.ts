import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TransferController } from 'src/Controllers/TransferController';
import { TransferService } from 'src/Services/TransferService';
import { TransferResponseDto } from 'src/Models/Response/TransferController/TransferResponseDto';
import { CompanyResponseDto } from 'src/Models/Response/CompanyController/CompanyResponseDto';
import { CreateTransferRequestDto } from 'src/Models/Request/TransferController/CreateTransferRequestDto';

describe('TransferController', () => {
    let controller: TransferController;
    let mockTransferService: any;

    beforeEach(async () => {
        mockTransferService = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByCompanyId: jest.fn(),
            findCompaniesWithTransfersLastMonth: jest.fn(),
            createTransfer: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [TransferController],
            providers: [
                {
                    provide: TransferService,
                    useValue: mockTransferService,
                },
            ],
        }).compile();

        controller = module.get<TransferController>(TransferController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all transfers', async () => {
            const transfers = [
                new TransferResponseDto('1', 1000, '1', '123456', '654321', new Date()),
                new TransferResponseDto('2', 2000, '2', '123456', '654321', new Date()),
            ];
            mockTransferService.findAll.mockResolvedValue(transfers);

            const result = await controller.findAll();
            expect(result).toHaveLength(2);
            expect(result[0].amount).toBe(1000);
            expect(result[1].amount).toBe(2000);
            expect(mockTransferService.findAll).toHaveBeenCalled();
        });
    });

    describe('findById', () => {
        it('should return a transfer by id', async () => {
            const transfer = new TransferResponseDto('1', 1000, '1', '123456', '654321', new Date());
            mockTransferService.findById.mockResolvedValue(transfer);

            const result = await controller.findById('1');
            expect(result).toBeDefined();
            expect(result.amount).toBe(1000);
            expect(mockTransferService.findById).toHaveBeenCalledWith('1');
        });

        it('should throw NotFoundException if transfer not found', async () => {
            mockTransferService.findById.mockResolvedValue(null);

            await expect(controller.findById('999')).rejects.toThrow(NotFoundException);
            expect(mockTransferService.findById).toHaveBeenCalledWith('999');
        });
    });

    describe('findByCompanyId', () => {
        it('should return transfers by company id', async () => {
            const transfers = [
                new TransferResponseDto('1', 1000, '1', '123456', '654321', new Date()),
                new TransferResponseDto('2', 2000, '1', '123456', '654321', new Date()),
            ];
            mockTransferService.findByCompanyId.mockResolvedValue(transfers);

            const result = await controller.findByCompanyId('1');
            expect(result).toHaveLength(2);
            expect(result[0].companyId).toBe('1');
            expect(result[1].companyId).toBe('1');
            expect(mockTransferService.findByCompanyId).toHaveBeenCalledWith('1');
        });
    });

    describe('findCompaniesWithTransfersLastMonth', () => {
        it('should return companies with transfers last month', async () => {
            const companies = [
                new CompanyResponseDto('1', '30123456780', 'Empresa A', new Date()),
                new CompanyResponseDto('2', '30123456781', 'Empresa B', new Date()),
            ];
            mockTransferService.findCompaniesWithTransfersLastMonth.mockResolvedValue(companies);

            const result = await controller.findCompaniesAdheringLastMonth();
            expect(result).toHaveLength(2);
            expect(mockTransferService.findCompaniesWithTransfersLastMonth).toHaveBeenCalled();
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
            const createdTransfer = new TransferResponseDto('1', 1000, '1', '123456', '654321', new Date());

            mockTransferService.createTransfer.mockResolvedValue(createdTransfer);

            const result = await controller.createTransfer(createTransferDto);
            expect(result).toBeDefined();
            expect(result.amount).toBe(1000);
            expect(result.companyId).toBe('1');
            expect(mockTransferService.createTransfer).toHaveBeenCalledWith(createTransferDto);
        });
    });
});