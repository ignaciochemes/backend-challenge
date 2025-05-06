import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransferStatus } from 'src/Enums/TransferStatusEnum';
import { Transfer } from 'src/Models/Entities/TransferEntity';
import { Repository } from 'typeorm';

@Injectable()
export class TransferDao {
    private readonly _logger = new Logger(TransferDao.name);

    constructor(
        @InjectRepository(Transfer)
        private readonly transferRepository: Repository<Transfer>
    ) { }

    /**
    * Save a transfer entity
    * @param transfer Transfer to save
    * @returns Saved transfer
    */
    async save(transfer: Transfer): Promise<Transfer> {
        this._logger.debug(`Saving transfer for company ID: ${transfer.getCompanyId()?.id}`);
        return this.transferRepository.save(transfer);
    }

    /**
    * Find all transfers with pagination
    * @param skip Number of records to skip
    * @param take Number of records to take
    * @returns List of transfers
    */
    async findAll(skip = 0, take = 10): Promise<Transfer[]> {
        this._logger.debug(`Finding all transfers - skip: ${skip}, take: ${take}`);

        const query = this.transferRepository
            .createQueryBuilder('transfer')
            .leftJoinAndSelect('transfer.companyId', 'company')
            .where('transfer.deleted_at IS NULL')
            .orderBy('transfer.created_at', 'DESC')
            .skip(skip)
            .take(take)
            .getMany();
        return query;
    }

    /**
    * Find a transfer by ID
    * @param id Transfer ID
    * @returns Transfer or null
    */
    async findById(id: string): Promise<Transfer | null> {
        this._logger.debug(`Finding transfer by ID: ${id}`);
        if (/^\d+$/.test(id)) {
            const numericId = parseInt(id, 10);
            try {
                const transfer = await this.transferRepository
                    .createQueryBuilder('transfer')
                    .leftJoinAndSelect('transfer.companyId', 'company')
                    .where('transfer.id = :id', { id: numericId })
                    .andWhere('transfer.deleted_at IS NULL')
                    .getOne();

                if (transfer) return transfer;
            } catch (error) {
                this._logger.error(`Error finding transfer by numeric ID: ${error.message}`);
            }
        }
        try {
            return this.transferRepository
                .createQueryBuilder('transfer')
                .leftJoinAndSelect('transfer.companyId', 'company')
                .where('transfer.uuid = :uuid', { uuid: id })
                .andWhere('transfer.deleted_at IS NULL')
                .getOne();
        } catch (error) {
            this._logger.error(`Error finding transfer by UUID: ${error.message}`);
            return null;
        }
    }

    /**
    * Count total number of transfers (for pagination)
    * @returns Total number of transfers
    */
    async count(): Promise<number> {
        const query = this.transferRepository
            .createQueryBuilder('transfer')
            .where('transfer.deleted_at IS NULL')
            .getCount();
        return query;
    }

    /**
    * Find transfers by company ID
    * @param companyId Company ID
    * @returns List of transfers
    */
    async findByCompanyId(companyId: string): Promise<Transfer[]> {
        this._logger.debug(`Finding transfers by company ID: ${companyId}`);
        const query = this.transferRepository
            .createQueryBuilder('transfer')
            .leftJoinAndSelect('transfer.companyId', 'company')
            .where('transfer.deleted_at IS NULL');

        if (/^\d+$/.test(companyId)) {
            query.andWhere('company.id = :companyId', { companyId: parseInt(companyId, 10) });
        } else {
            query.andWhere('company.uuid = :companyId', { companyId });
        }

        return query
            .orderBy('transfer.transfer_date', 'DESC')
            .getMany();
    }

    /**
    * Find companies with transfers in the last month
    * @returns Array of company IDs
    */
    async findCompaniesWithTransfersLastMonth(): Promise<string[]> {
        this._logger.debug('Finding companies with transfers last month');

        const today = new Date();
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const startOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);

        const query = await this.transferRepository
            .createQueryBuilder('transfer')
            .select('DISTINCT transfer.company_id')
            .innerJoin('transfer.companyId', 'company')
            .where('transfer.transfer_date >= :startDate', { startDate: startOfLastMonth })
            .andWhere('transfer.transfer_date <= :endDate', { endDate: endOfLastMonth })
            .andWhere('transfer.deleted_at IS NULL')
            .andWhere('transfer.status = :status', { status: TransferStatus.COMPLETED })
            .getRawMany();

        return query.map(item => item.company_id);
    }

    /**
    * Find transfers by date range
    * @param startDate Start date
    * @param endDate End date
    * @returns List of transfers
    */
    async findByDateRange(startDate: Date, endDate: Date): Promise<Transfer[]> {
        this._logger.debug(`Finding transfers between ${startDate} and ${endDate}`);
        const query = this.transferRepository
            .createQueryBuilder('transfer')
            .leftJoinAndSelect('transfer.companyId', 'company')
            .where('transfer.transfer_date >= :startDate', { startDate })
            .andWhere('transfer.transfer_date <= :endDate', { endDate })
            .andWhere('transfer.deleted_at IS NULL')
            .orderBy('transfer.transfer_date', 'DESC')
            .getMany();
        return query;
    }

    /**
    * Find transfers by amount range
    * @param minAmount Minimum amount
    * @param maxAmount Maximum amount
    * @returns List of transfers
    */
    async findByAmountRange(minAmount: number, maxAmount: number): Promise<Transfer[]> {
        this._logger.debug(`Finding transfers with amount between ${minAmount} and ${maxAmount}`);

        return this.transferRepository
            .createQueryBuilder('transfer')
            .leftJoinAndSelect('transfer.companyId', 'company')
            .where('transfer.amount >= :minAmount', { minAmount })
            .andWhere('transfer.amount <= :maxAmount', { maxAmount })
            .andWhere('transfer.deleted_at IS NULL')
            .orderBy('transfer.amount', 'DESC')
            .getMany();
    }

    /**
    * Find transfers by status
    * @param status Transfer status
    * @returns List of transfers
    */
    async findByStatus(status: TransferStatus): Promise<Transfer[]> {
        this._logger.debug(`Finding transfers with status: ${status}`);
        const query = this.transferRepository.createQueryBuilder('transfer')
            .leftJoinAndSelect('transfer.companyId', 'company')
            .where('transfer.deleted_at IS NULL')
            .andWhere('transfer.status = :status', { status })
            .orderBy('transfer.created_at', 'DESC')
            .getMany();
        return query;
    }

    /**
    * Soft delete a transfer
    * @param id Transfer ID
    * @returns Delete result
    */
    async softDelete(id: string): Promise<boolean> {
        this._logger.debug(`Soft deleting transfer ID: ${id}`);
        const transfer = await this.findById(id);
        if (!transfer) {
            return false;
        }
        transfer.deletedAt = new Date();
        await this.transferRepository.save(transfer);
        return true;
    }

    /**
    * Update transfer status
    * @param id Transfer ID
    * @param status New status
    * @returns Updated transfer
    */
    async updateStatus(id: string, status: TransferStatus): Promise<Transfer | null> {
        this._logger.debug(`Updating transfer ${id} status to ${status}`);
        const transfer = await this.findById(id);
        if (!transfer) {
            return null;
        }
        transfer.setStatus(status);
        if (status === TransferStatus.COMPLETED || status === TransferStatus.FAILED) {
            transfer.setProcessedDate(new Date());
        }

        return this.transferRepository.save(transfer);
    }
}