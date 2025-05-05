import { Injectable, NotFoundException } from '@nestjs/common';
import { TransferDao } from 'src/Daos/TransferDao';
import { TransferResponseDto } from 'src/Models/Response/TransferController/TransferResponseDto';
import { CompanyResponseDto } from 'src/Models/Response/CompanyController/CompanyResponseDto';
import { CreateTransferRequestDto } from 'src/Models/Request/TransferController/CreateTransferRequestDto';
import { Transfer } from 'src/Models/Entities/TransferEntity';
import HttpCustomException from 'src/Exceptions/HttpCustomException';
import { StatusCodeEnums } from 'src/Enums/StatusCodeEnum';
import { CompanyDao } from 'src/Daos/CompanyDao';
import GenericResponse from 'src/Models/Response/GenericResponse';


@Injectable()
export class TransferService {
    constructor(
        private readonly _transferDao: TransferDao,
        private readonly _companyDao: CompanyDao,
    ) { }

    async createTransfer(createTransferDto: CreateTransferRequestDto): Promise<GenericResponse> {
        const company = await this._companyDao.findById(createTransferDto.companyId);
        if (!company) {
            throw new NotFoundException(`Company with ID ${createTransferDto.companyId} not found`);
        }
        const newTransfer = new Transfer();
        newTransfer.setAmount(createTransferDto.amount);
        newTransfer.setCompanyId(company);
        newTransfer.setDebitAccount(createTransferDto.debitAccount);
        newTransfer.setCreditAccount(createTransferDto.creditAccount);
        newTransfer.setTransferDate(new Date());
        await this._transferDao.save(newTransfer);
        return new GenericResponse('Transfer created successfully');
    }

    async findAll(): Promise<TransferResponseDto[]> {
        const transfers: Transfer[] = await this._transferDao.findAll();
        if (!transfers || transfers.length === 0) {
            throw new HttpCustomException('No transfers found', StatusCodeEnums.NOT_TRANSFERS_FOUND);
        }
        let response: TransferResponseDto[] = [];
        response = transfers.map(transfer => {
            return new TransferResponseDto(transfer);
        });
        return response;
    }

    async findById(id: string): Promise<TransferResponseDto | null> {
        const transfer: Transfer = await this._transferDao.findById(id);
        if (!transfer) {
            throw new HttpCustomException('Transfer not found', StatusCodeEnums.TRANSFER_NOT_FOUND);
        }
        return new TransferResponseDto(transfer);
    }

    async findByCompanyId(companyId: string): Promise<TransferResponseDto[]> {
        const transfers: Transfer[] = await this._transferDao.findByCompanyId(companyId);
        if (!transfers || transfers.length === 0) {
            throw new HttpCustomException('No transfers found for this company', StatusCodeEnums.NOT_TRANSFERS_FOUND);
        }
        let response: TransferResponseDto[] = [];
        response = transfers.map(transfer => {
            return new TransferResponseDto(transfer);
        });
        return response;
    }

    async findCompaniesWithTransfersLastMonth(): Promise<CompanyResponseDto[]> {
        const companyIds = await this._transferDao.findCompaniesWithTransfersLastMonth();
        if (!companyIds || companyIds.length === 0) {
            throw new HttpCustomException('No companies found with transfers last month', StatusCodeEnums.NOT_COMPANIES_FOUND);
        }
        const companies: CompanyResponseDto[] = await Promise.all(
            companyIds.map(async (companyId) => {
                const company = await this._companyDao.findById(companyId);
                if (!company) {
                    throw new HttpCustomException(`Company with ID ${companyId} not found`, StatusCodeEnums.COMPANY_NOT_FOUND);
                }
                return new CompanyResponseDto(company);
            })
        );
        return companies;
    }
}