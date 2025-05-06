import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from 'src/Models/Entities/CompanyEntity';
import { Repository } from 'typeorm';

@Injectable()
export class CompanyDao {
    constructor(
        @InjectRepository(Company)
        private readonly companyRepository: Repository<Company>
    ) { }

    /**
    * Save a company entity
    * @param company Company to save
    * @returns Saved company
    */
    async save(company: Company): Promise<Company> {
        return this.companyRepository.save(company);
    }

    /**
    * Find all companies with pagination
    * @param skip Number of records to skip
    * @param take Number of records to take
    * @returns List of companies
    */
    async findAll(skip = 0, take = 10): Promise<Company[]> {
        const query = this.companyRepository
            .createQueryBuilder('company')
            .where('company.deleted_at IS NULL')
            .orderBy('company.created_at', 'DESC')
            .skip(skip)
            .take(take)
            .getMany();
        return query;
    }

    /**
    * Count total number of companies (for pagination)
    * @returns Total number of companies
    */
    async count(): Promise<number> {
        const query = this.companyRepository
            .createQueryBuilder('company')
            .where('company.deleted_at IS NULL')
            .getCount();
        return query;
    }

    /**
    * Find a company by ID
    * @param id Company ID
    * @returns Company or null
    */
    async findById(id: string): Promise<Company | null> {
        const query = this.companyRepository
            .createQueryBuilder('company')
            .where('(company.id = :numericId OR company.uuid = :uuid)', {
                numericId: /^\d+$/.test(id) ? parseInt(id, 10) : -1,
                uuid: id
            })
            .andWhere('company.deleted_at IS NULL')
            .getOne();
        return query;
    }

    /**
    * Find a company by CUIT
    * @param cuit Company CUIT
    * @returns Company or null
    */
    async findByCuit(cuit: string): Promise<Company | null> {
        const query = this.companyRepository
            .createQueryBuilder('company')
            .where('company.cuit = :cuit', { cuit })
            .andWhere('company.deleted_at IS NULL')
            .getOne();
        return query;
    }

    /**
    * Find companies that adhered in the last month
    * @returns List of companies
    */
    async findCompaniesAdheringLastMonth(): Promise<Company[]> {
        const today = new Date();
        const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const query = this.companyRepository
            .createQueryBuilder('company')
            .where('company.adhesion_date >= :startDate', { startDate: firstDayOfLastMonth })
            .andWhere('company.adhesion_date < :endDate', { endDate: firstDayOfCurrentMonth })
            .andWhere('company.deleted_at IS NULL')
            .getMany();
        return query;
    }

    /**
    * Soft delete a company
    * @param id Company ID
    * @returns Delete result
    */
    async softDelete(id: string): Promise<boolean> {
        const company = await this.companyRepository
            .createQueryBuilder('company')
            .where('company.id = :id', { id })
            .andWhere('company.deleted_at IS NULL')
            .getOne();

        company.deletedAt = new Date();
        await this.companyRepository.save(company);
        return true;
    }

    /**
    * Find multiple companies by IDs
    * @param ids Array of company IDs
    * @returns List of companies
    */
    async findByIds(ids: string[]): Promise<Company[]> {
        const numericIds = ids.filter(id => /^\d+$/.test(id)).map(id => parseInt(id, 10));
        const uuidIds = ids.filter(id => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));
        const query = this.companyRepository
            .createQueryBuilder('company')
            .where('company.deleted_at IS NULL');

        if (numericIds.length > 0) {
            query.orWhere('company.id IN (:...numericIds)', { numericIds });
        }
        if (uuidIds.length > 0) {
            query.orWhere('company.uuid IN (:...uuidIds)', { uuidIds });
        }
        return query.getMany();
    }
}