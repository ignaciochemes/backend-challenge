import { Test, TestingModule } from '@nestjs/testing';
import { TransferController } from 'src/Controllers/TransferController';
import { StatusCodeEnums } from 'src/Enums/StatusCodeEnum';
import { TransferStatus } from 'src/Enums/TransferStatusEnum';
import HttpCustomException from 'src/Exceptions/HttpCustomException';
import ResponseFormatter from 'src/Helpers/Formatter/ResponseFormatter';
import { IPaginationMetadata } from 'src/Interfaces/PaginationMetadata';
import { CreateTransferRequestDto } from 'src/Models/Request/TransferController/CreateTransferRequestDto';
import { FindTransferQueryRequest } from 'src/Models/Request/TransferController/FindTransferQueryRequest';
import { CompanyResponseDto } from 'src/Models/Response/CompanyController/CompanyResponseDto';
import GenericResponse from 'src/Models/Response/GenericResponse';
import { PaginatedResponseDto } from 'src/Models/Response/PaginatedResponseDto';
import { TransferResponseDto } from 'src/Models/Response/TransferController/TransferResponseDto';
import { TransferService } from 'src/Services/TransferService';

describe('TransferController', () => {
    let controller: TransferController;
    let service: TransferService;

    const mockTransferService = {
        createTransfer: jest.fn(),
        findAll: jest.fn(),
        findById: jest.fn(),
        findByCompanyId: jest.fn(),
        findCompaniesWithTransfersLastMonth: jest.fn(),
    };

    beforeEach(async () => {
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
        service = module.get<TransferService>(TransferService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
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
            const expectedResponse = new GenericResponse('Transfer created successfully');
            mockTransferService.createTransfer.mockResolvedValue(expectedResponse);
            const result = await controller.createTransfer(createTransferDto);
            expect(service.createTransfer).toHaveBeenCalledWith(createTransferDto);
            expect(result).toBeInstanceOf(ResponseFormatter);
            expect(result.result).toEqual(expectedResponse);
        });

        it('should handle errors when creating a transfer', async () => {
            const createTransferDto: CreateTransferRequestDto = {
                amount: 1000,
                companyId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
                debitAccount: '123456789012',
                creditAccount: '987654321012',
            };
            mockTransferService.createTransfer.mockRejectedValue(
                new HttpCustomException(
                    'Failed to create transfer',
                    StatusCodeEnums.TRANSFER_NOT_FOUND,
                    'Transaction Error',
                    { error: 'Transaction Error' }
                )
            );
            await expect(controller.createTransfer(createTransferDto)).rejects.toThrow(HttpCustomException);
        });
    });

    describe('findAll', () => {
        it('should return all transfers with pagination', async () => {
            const query: FindTransferQueryRequest = {
                page: 0,
                limit: 10,
            };
            const mockTransfers: TransferResponseDto[] = [
                createMockTransferResponse(1),
                createMockTransferResponse(2),
            ];
            const paginationMetadata: IPaginationMetadata = {
                currentPage: 0,
                pageSize: 10,
                totalItems: 2,
                totalPages: 1,
                hasNextPage: false,
                hasPreviousPage: false,
            };
            const paginatedResponse = new PaginatedResponseDto(mockTransfers, paginationMetadata);
            mockTransferService.findAll.mockResolvedValue(paginatedResponse);
            const result = await controller.findAll(query);
            expect(service.findAll).toHaveBeenCalledWith(query);
            expect(result).toBeInstanceOf(ResponseFormatter);
            expect(result.result).toEqual(paginatedResponse);
            expect(result.result.data.length).toBe(2);
        });

        it('should handle errors when finding all transfers', async () => {
            const query: FindTransferQueryRequest = {
                page: 0,
                limit: 10,
            };
            mockTransferService.findAll.mockRejectedValue(
                new HttpCustomException('No transfers found', StatusCodeEnums.NOT_TRANSFERS_FOUND)
            );
            await expect(controller.findAll(query)).rejects.toThrow(HttpCustomException);
        });
    });

    describe('findById', () => {
        it('should return a transfer by ID', async () => {
            const transferId = '1';
            const mockTransfer = createMockTransferResponse(1);
            mockTransferService.findById.mockResolvedValue(mockTransfer);
            const result = await controller.findById(transferId);
            expect(service.findById).toHaveBeenCalledWith(transferId);
            expect(result).toBeInstanceOf(ResponseFormatter);
            expect(result.result).toEqual(mockTransfer);
        });

        it('should handle errors when finding a transfer by ID', async () => {
            const transferId = '999';
            mockTransferService.findById.mockRejectedValue(
                new HttpCustomException('Transfer not found', StatusCodeEnums.TRANSFER_NOT_FOUND)
            );
            await expect(controller.findById(transferId)).rejects.toThrow(HttpCustomException);
        });
    });

    describe('findByCompanyId', () => {
        it('should return transfers by company ID', async () => {
            const companyId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
            const mockTransfers: TransferResponseDto[] = [
                createMockTransferResponse(1),
                createMockTransferResponse(2),
            ];
            mockTransferService.findByCompanyId.mockResolvedValue(mockTransfers);
            const result = await controller.findByCompanyId(companyId);
            expect(service.findByCompanyId).toHaveBeenCalledWith(companyId);
            expect(result).toBeInstanceOf(ResponseFormatter);
            expect(result.result).toEqual(mockTransfers);
            expect(result.result.length).toBe(2);
        });

        it('should handle errors when finding transfers by company ID', async () => {
            const companyId = 'invalid-uuid';
            mockTransferService.findByCompanyId.mockRejectedValue(
                new HttpCustomException('No transfers found for this company', StatusCodeEnums.NOT_TRANSFERS_FOUND)
            );
            await expect(controller.findByCompanyId(companyId)).rejects.toThrow(HttpCustomException);
        });
    });

    describe('findCompaniesAdheringLastMonth', () => {
        it('should return companies with transfers in the last month', async () => {
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
            mockTransferService.findCompaniesWithTransfersLastMonth.mockResolvedValue(mockCompanies);
            const result = await controller.findCompaniesAdheringLastMonth();
            expect(service.findCompaniesWithTransfersLastMonth).toHaveBeenCalled();
            expect(result).toBeInstanceOf(ResponseFormatter);
            expect(result.result).toEqual(mockCompanies);
            expect(result.result.length).toBe(2);
        });

        it('should handle errors when finding companies with transfers last month', async () => {
            mockTransferService.findCompaniesWithTransfersLastMonth.mockRejectedValue(
                new HttpCustomException('No companies found with transfers last month', StatusCodeEnums.NOT_COMPANIES_FOUND)
            );
            await expect(controller.findCompaniesAdheringLastMonth()).rejects.toThrow(HttpCustomException);
        });
    });

    function createMockTransferResponse(id: number): TransferResponseDto {
        const mockCompanyData: Partial<CompanyResponseDto> = {
            id: 1,
            uuid: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            cuit: '30-71659554-9',
            businessName: 'Test Company',
        };

        const transferResponse = {
            id: id,
            uuid: `uuid-${id}`,
            amount: 1000 * id,
            company: mockCompanyData,
            debitAccount: '****789012',
            creditAccount: '****321012',
            transferDate: new Date(),
            status: TransferStatus.COMPLETED,
            description: `Test transfer ${id}`,
            referenceId: `REF-TEST-00${id}`,
            processedDate: new Date(),
            currency: 'ARS',
            createdAt: new Date(),
        };
        return transferResponse as TransferResponseDto;
    }
});