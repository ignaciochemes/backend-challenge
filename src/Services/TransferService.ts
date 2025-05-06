import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TransferDao } from 'src/Daos/TransferDao';
import { TransferResponseDto } from 'src/Models/Response/TransferController/TransferResponseDto';
import { CompanyResponseDto } from 'src/Models/Response/CompanyController/CompanyResponseDto';
import { CreateTransferRequestDto } from 'src/Models/Request/TransferController/CreateTransferRequestDto';
import { Transfer } from 'src/Models/Entities/TransferEntity';
import HttpCustomException from 'src/Exceptions/HttpCustomException';
import { StatusCodeEnums } from 'src/Enums/StatusCodeEnum';
import { CompanyDao } from 'src/Daos/CompanyDao';
import GenericResponse from 'src/Models/Response/GenericResponse';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { FindTransferQueryRequest } from 'src/Models/Request/TransferController/FindTransferQueryRequest';
import { IPaginationMetadata } from 'src/Interfaces/PaginationMetadata';
import { PaginatedResponseDto } from 'src/Models/Response/PaginatedResponseDto';
import { Company } from 'src/Models/Entities/CompanyEntity';
import { TransferStatus } from 'src/Enums/TransferStatusEnum';


@Injectable()
export class TransferService {
    private readonly _logger = new Logger(TransferService.name);
    private readonly _MAX_TRANSFER_AMOUNT = 1000000;

    constructor(
        private readonly _transferDao: TransferDao,
        private readonly _companyDao: CompanyDao,
        private readonly dataSource: DataSource,
    ) { }

    /**
    * Creates a new transfer with validation and proper transaction handling
    * @param createTransferDto Transfer data to create
    * @returns Generic response with success message
    */
    async createTransfer(createTransferDto: CreateTransferRequestDto): Promise<GenericResponse> {
        this._logger.log(`Starting transfer creation process for company ID: ${createTransferDto.companyId}`);
        this._validateTransferAmount(createTransferDto.amount);
        this._validateAccountNumbers(createTransferDto.debitAccount, createTransferDto.creditAccount);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const company = await this._companyDao.findById(createTransferDto.companyId);
            if (!company) {
                throw new NotFoundException(`Company with ID ${createTransferDto.companyId} not found`);
            }
            const newTransfer = new Transfer();
            newTransfer.setUuid(uuidv4());
            newTransfer.setAmount(this._sanitizeAmount(createTransferDto.amount));
            newTransfer.setCompanyId(company);
            newTransfer.setDebitAccount(this._sanitizeAccountNumber(createTransferDto.debitAccount));
            newTransfer.setCreditAccount(this._sanitizeAccountNumber(createTransferDto.creditAccount));
            newTransfer.setTransferDate(new Date());
            newTransfer.setStatus(createTransferDto.status ?? TransferStatus.PENDING);
            newTransfer.setDebitAccount(createTransferDto.description ?? null);
            newTransfer.setReferenceId(createTransferDto.referenceId ?? null);
            newTransfer.setProcessedDate(new Date());
            newTransfer.setCurrency(createTransferDto.currency ?? 'ARS');
            await this._transferDao.save(newTransfer);
            await queryRunner.commitTransaction();

            this._logger.log(`Transfer created successfully: ${newTransfer.getUuid()}`);
            return new GenericResponse('Transfer created successfully');

        } catch (error) {
            await queryRunner.rollbackTransaction();
            this._logger.error(`Error creating transfer: ${error.message}`, error.stack);

            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new HttpCustomException(
                'Failed to create transfer',
                StatusCodeEnums.TRANSFER_NOT_FOUND,
                'Transaction Error',
                { error: error.message }
            );
        } finally {
            await queryRunner.release();
        }
    }

    /**
    * Retrieves all transfers with pagination
    * @param page Page number (default: 1)
    * @param limit Results per page (default: 10)
    * @returns List of transfer DTOs
    */
    async findAll(query: FindTransferQueryRequest): Promise<PaginatedResponseDto<TransferResponseDto>> {
        this._logger.log(`Fetching all transfers - page: ${query.page}, limit: ${query.limit}`);
        try {
            const page = query.page ? parseInt(query.page.toString(), 10) : 0;
            const limit = query.limit ? parseInt(query.limit.toString(), 10) : 10;
            const [transfers, totalItems] = await this._transferDao.findAll(page, limit);
            if (!transfers || transfers.length === 0) {
                throw new HttpCustomException('No transfers found', StatusCodeEnums.NOT_TRANSFERS_FOUND);
            }
            const totalPages = Math.ceil(totalItems / limit);
            const paginationMetadata: IPaginationMetadata = {
                currentPage: page,
                pageSize: limit,
                totalItems: totalItems,
                totalPages: totalPages,
                hasNextPage: page < totalPages - 1,
                hasPreviousPage: page > 0
            };
            return new PaginatedResponseDto(
                transfers.map(transfer => new TransferResponseDto(transfer)),
                paginationMetadata
            );
        } catch (error) {
            this._logger.error(`Error finding all transfers: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
    * Finds a transfer by ID with error handling
    * @param id Transfer ID
    * @returns Transfer DTO or null
    */
    async findById(id: string): Promise<TransferResponseDto | null> {
        this._logger.log(`Finding transfer by ID: ${id}`);
        try {
            if (!this._isValidId(id)) {
                throw new HttpCustomException('Invalid transfer ID format', StatusCodeEnums.TRANSFER_NOT_FOUND);
            }
            const transfer: Transfer = await this._transferDao.findById(id);
            if (!transfer) {
                throw new HttpCustomException('Transfer not found', StatusCodeEnums.TRANSFER_NOT_FOUND);
            }
            return new TransferResponseDto(transfer);
        } catch (error) {
            this._logger.error(`Error finding transfer by ID: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
    * Finds transfers by company ID
    * @param companyId Company ID
    * @returns List of transfer DTOs
    */
    async findByCompanyId(companyId: string): Promise<TransferResponseDto[]> {
        this._logger.log(`Finding transfers for company ID: ${companyId}`);
        try {
            if (!this._isValidId(companyId)) {
                throw new HttpCustomException('Invalid company ID format', StatusCodeEnums.COMPANY_NOT_FOUND);
            }
            const company = await this._companyDao.findById(companyId);
            if (!company) {
                throw new HttpCustomException(`Company with ID ${companyId} not found`, StatusCodeEnums.COMPANY_NOT_FOUND);
            }
            const transfers: Transfer[] = await this._transferDao.findByCompanyId(companyId);
            if (!transfers || transfers.length === 0) {
                throw new HttpCustomException('No transfers found for this company', StatusCodeEnums.NOT_TRANSFERS_FOUND);
            }
            return transfers.map(transfer => new TransferResponseDto(transfer));
        } catch (error) {
            this._logger.error(`Error finding transfers by company ID: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
    * Finds companies with transfers in the last month
    * @returns List of company DTOs
    */
    async findCompaniesWithTransfersLastMonth(): Promise<CompanyResponseDto[]> {
        this._logger.log('Finding companies with transfers last month');
        try {
            const companyIds: string[] = await this._transferDao.findCompaniesWithTransfersLastMonth();
            if (!companyIds || companyIds.length === 0) {
                throw new HttpCustomException('No companies found with transfers last month', StatusCodeEnums.NOT_COMPANIES_FOUND);
            }
            const companyPromises = companyIds.map(async (companyId) => {
                try {
                    const company: Company = await this._companyDao.findById(companyId);
                    if (!company) {
                        this._logger.warn(`Company with ID ${companyId} found in transfers but does not exist`);
                        return null;
                    }
                    return new CompanyResponseDto(company);
                } catch (error) {
                    this._logger.warn(`Error retrieving company ${companyId}: ${error.message}`);
                    return null;
                }
            });
            const companies = (await Promise.all(companyPromises)).filter(company => company !== null);
            if (companies.length === 0) {
                throw new HttpCustomException('Failed to retrieve companies with transfers last month', StatusCodeEnums.NOT_COMPANIES_FOUND);
            }
            return companies;
        } catch (error) {
            this._logger.error(`Error finding companies with transfers last month: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
    * Validates transfer amount is within acceptable limits
    * @param amount Amount to validate
    */
    private _validateTransferAmount(amount: number): void {
        if (amount <= 0) {
            throw new BadRequestException('Transfer amount must be greater than zero');
        }
        if (amount > this._MAX_TRANSFER_AMOUNT) {
            throw new BadRequestException(`Transfer amount exceeds maximum allowed (${this._MAX_TRANSFER_AMOUNT})`);
        }
    }

    /**
    * Validates account numbers are properly formatted and different from each other
    * @param debitAccount Debit account number
    * @param creditAccount Credit account number
    */
    private _validateAccountNumbers(debitAccount: string, creditAccount: string): void {
        if (!/^\d{5,12}$/.test(debitAccount)) {
            throw new BadRequestException('Debit account must be numeric and between 5-12 digits');
        }
        if (!/^\d{5,12}$/.test(creditAccount)) {
            throw new BadRequestException('Credit account must be numeric and between 5-12 digits');
        }
        if (debitAccount === creditAccount) {
            throw new BadRequestException('Debit and credit accounts cannot be the same');
        }
    }

    /**
    * Sanitizes and formats account number
    * @param accountNumber Account number to sanitize
    * @returns Sanitized account number
    */
    private _sanitizeAccountNumber(accountNumber: string): string {
        return accountNumber.replace(/\D/g, '');
    }

    /**
    * Sanitizes transfer amount
    * @param amount Amount to sanitize
    * @returns Sanitized amount
    */
    private _sanitizeAmount(amount: number): number {
        return Math.round(Math.abs(amount) * 100) / 100;
    }

    /**
    * Validates ID format
    * @param id ID to validate
    * @returns true if valid, false otherwise
    */
    private _isValidId(id: string): boolean {
        return /^\d+$/.test(id) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    }
}