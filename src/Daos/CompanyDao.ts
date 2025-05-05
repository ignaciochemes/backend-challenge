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

    async save(company: Company): Promise<Company> {
        return this.companyRepository.save(company);
    }

    async findAll(): Promise<Company[]> {
        const query = this.companyRepository
            .createQueryBuilder('company')
            .getMany();
        return query;
    }

    async findById(id: string): Promise<Company | null> {
        const query = this.companyRepository
            .createQueryBuilder('company')
            .where('company.id = :id', { id })
            .getOne();
        return query;
    }

    async findByCuit(cuit: string): Promise<Company | null> {
        const query = this.companyRepository
            .createQueryBuilder('company')
            .where('company.cuit = :cuit', { cuit })
            .getOne();
        return query;
    }

    async findCompaniesAdheringLastMonth(): Promise<Company[]> {
        const today = new Date();
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const startOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);

        return this.companyRepository
            .createQueryBuilder('company')
            .where('company.adhesionDate >= :startDate', { startDate: startOfLastMonth })
            .andWhere('company.adhesionDate <= :endDate', { endDate: endOfLastMonth })
            .getMany();
    }
}