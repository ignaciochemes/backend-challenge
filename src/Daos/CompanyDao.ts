import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from 'src/Models/Entities/CompanyEntity';
import { Repository } from 'typeorm';

@Injectable()
export class CompanyDao {
    private readonly _logger = new Logger(CompanyDao.name);

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
        this._logger.debug(`Saving company with CUIT: ${company.getCuit()}`);
        return this.companyRepository.save(company);
    }

    /**
    * Find all companies with pagination
    * @param skip Number of records to skip
    * @param take Number of records to take
    * @returns List of companies
    */
    async findAll(skip = 0, take = 10): Promise<Company[]> {
        this._logger.debug(`Finding all companies - skip: ${skip}, take: ${take}`);
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
        this._logger.debug(`Finding company by ID: ${id}`);
        if (/^\d+$/.test(id)) {
            const numericId = parseInt(id, 10);
            try {
                const company = await this.companyRepository
                    .createQueryBuilder('company')
                    .where('company.id = :id', { id: numericId })
                    .andWhere('company.deleted_at IS NULL')
                    .getOne();

                if (company) return company;
            } catch (error) {
                this._logger.error(`Error finding company by numeric ID: ${error.message}`);
            }
        }
        try {
            return this.companyRepository
                .createQueryBuilder('company')
                .where('company.uuid = :uuid', { uuid: id })
                .andWhere('company.deleted_at IS NULL')
                .getOne();
        } catch (error) {
            this._logger.error(`Error finding company by UUID: ${error.message}`);
            return null;
        }
    }

    /**
    * Find a company by CUIT
    * @param cuit Company CUIT
    * @returns Company or null
    */
    async findByCuit(cuit: string): Promise<Company | null> {
        this._logger.debug(`Finding company by CUIT: ${cuit}`);
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
        this._logger.debug('Finding companies adhering last month');

        const today = new Date();
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const startOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);

        return this.companyRepository
            .createQueryBuilder('company')
            .where('company.adhesion_date >= :startDate', { startDate: startOfLastMonth })
            .andWhere('company.adhesion_date <= :endDate', { endDate: endOfLastMonth })
            .andWhere('company.deleted_at IS NULL')
            .orderBy('company.adhesion_date', 'DESC')
            .getMany();
    }

    /**
    * Soft delete a company
    * @param id Company ID
    * @returns Delete result
    */
    async softDelete(id: string): Promise<boolean> {
        this._logger.debug(`Soft deleting company ID: ${id}`);
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
        this._logger.debug(`Finding companies by IDs: ${ids.join(', ')}`);
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