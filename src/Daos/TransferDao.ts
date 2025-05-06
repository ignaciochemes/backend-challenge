import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransferStatus } from 'src/Enums/TransferStatusEnum';
import { Transfer } from 'src/Models/Entities/TransferEntity';
import { Repository } from 'typeorm';

@Injectable()
export class TransferDao {
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
        return await this.transferRepository.save(transfer);
    }

    /**
    * Find all transfers with pagination
    * @param skip Number of records to skip
    * @param take Number of records to take
    * @returns List of transfers
    */
    async findAll(skip = 0, take = 10): Promise<Transfer[]> {
        const query = await this.transferRepository
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
        const query = await this.transferRepository
            .createQueryBuilder('transfer')
            .where('(transfer.id = :numericId OR transfer.uuid = :uuid)', {
                numericId: /^\d+$/.test(id) ? parseInt(id, 10) : -1,
                uuid: id
            })
            .andWhere('transfer.deleted_at IS NULL')
            .getOne();
        return query;
    }

    /**
    * Count total number of transfers (for pagination)
    * @returns Total number of transfers
    */
    async count(): Promise<number> {
        const query = await this.transferRepository
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
        const query = await this.transferRepository
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
        const today = new Date();
        const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const query = await this.transferRepository
            .createQueryBuilder('transfer')
            .select('DISTINCT transfer.company_id')
            .where('transfer.transfer_date >= :startDate', { startDate: firstDayOfLastMonth })
            .andWhere('transfer.transfer_date < :endDate', { endDate: firstDayOfCurrentMonth })
            .andWhere('transfer.deleted_at IS NULL')
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
        const query = await this.transferRepository
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
        return await this.transferRepository
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
        const query = await this.transferRepository.createQueryBuilder('transfer')
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
        const transfer = await this.findById(id);
        if (!transfer) {
            return false;
        }
        transfer.deletedAt = new Date();
        await await this.transferRepository.save(transfer);
        return true;
    }

    /**
    * Update transfer status
    * @param id Transfer ID
    * @param status New status
    * @returns Updated transfer
    */
    async updateStatus(id: string, status: TransferStatus): Promise<Transfer | null> {
        const transfer = await this.findById(id);
        if (!transfer) {
            return null;
        }
        transfer.setStatus(status);
        if (status === TransferStatus.COMPLETED || status === TransferStatus.FAILED) {
            transfer.setProcessedDate(new Date());
        }

        return await this.transferRepository.save(transfer);
    }
}