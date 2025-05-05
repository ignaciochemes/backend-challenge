import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transfer } from 'src/Models/Entities/TransferEntity';
import { Repository } from 'typeorm';

@Injectable()
export class TransferDao {
    constructor(
        @InjectRepository(Transfer)
        private readonly transferRepository: Repository<Transfer>
    ) { }

    async save(transfer: Transfer): Promise<Transfer> {
        return this.transferRepository.save(transfer);
    }

    async findAll(): Promise<Transfer[]> {
        const query = this.transferRepository
            .createQueryBuilder('transfer')
            .leftJoinAndSelect('transfer.companyId', 'company')
            .getMany();
        return query;
    }

    async findById(id: string): Promise<Transfer | null> {
        const query = this.transferRepository
            .createQueryBuilder('transfer')
            .leftJoinAndSelect('transfer.companyId', 'company')
            .where('transfer.id = :id', { id })
            .getOne();
        return query;
    }

    async findByCompanyId(companyId: string): Promise<Transfer[]> {
        const query = this.transferRepository
            .createQueryBuilder('transfer')
            .leftJoinAndSelect('transfer.companyId', 'company')
            .where('transfer.companyId = :companyId', { companyId })
            .getMany();
        return query;
    }

    async findCompaniesWithTransfersLastMonth(): Promise<string[]> {
        const today = new Date();
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const startOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);

        const result = await this.transferRepository
            .createQueryBuilder('transfer')
            .select('DISTINCT transfer.companyId')
            .where('transfer.transferDate >= :startDate', { startDate: startOfLastMonth })
            .andWhere('transfer.transferDate <= :endDate', { endDate: endOfLastMonth })
            .getRawMany();

        return result.map(item => item.companyId);
    }
}