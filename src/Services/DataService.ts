import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from 'src/Models/Entities/CompanyEntity';
import { Transfer } from 'src/Models/Entities/TransferEntity';
import { Repository } from 'typeorm';

@Injectable()
export class DataSeederService implements OnModuleInit {
    constructor(
        @InjectRepository(Company)
        private readonly companyRepository: Repository<Company>,
        @InjectRepository(Transfer)
        private readonly transferRepository: Repository<Transfer>,
    ) { }

    async onModuleInit() {
        await this.seedData();
    }

    private async seedData() {
        const companies = await this.companyRepository.find();
        if (companies.length === 0) {
            await this.seedCompanies();
            await this.seedTransfers();
        }
    }

    private async seedCompanies() {
        console.log('Seeding companies...');

        const today = new Date();
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, today.getDate());

        const companies = [
            {
                cuit: '30123456780',
                businessName: 'Empresa A',
                adhesionDate: lastMonth,
            },
            {
                cuit: '30123456781',
                businessName: 'Empresa B',
                adhesionDate: lastMonth,
            },
            {
                cuit: '30123456782',
                businessName: 'Empresa C',
                adhesionDate: twoMonthsAgo,
            },
            {
                cuit: '30123456783',
                businessName: 'Empresa D',
                adhesionDate: twoMonthsAgo,
            },
            {
                cuit: '30123456784',
                businessName: 'Empresa E',
                adhesionDate: today,
            },
        ];

        for (const company of companies) {
            await this.companyRepository.save(company);
        }

        console.log('Companies seeded successfully');
    }

    private async seedTransfers() {
        console.log('Seeding transfers...');

        const companies = await this.companyRepository.find();
        const today = new Date();
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, today.getDate());

        const transfers = [
            // Transferencias de la Empresa A (el último mes)
            {
                amount: 1000,
                companyId: companies[0].id,
                debitAccount: '123456789',
                creditAccount: '987654321',
                transferDate: lastMonth,
            },
            // Transferencias de la Empresa B (el último mes)
            {
                amount: 2000,
                companyId: companies[1].id,
                debitAccount: '123456789',
                creditAccount: '987654321',
                transferDate: lastMonth,
            },
            // Transferencias de la Empresa C (hace dos meses)
            {
                amount: 3000,
                companyId: companies[2].id,
                debitAccount: '123456789',
                creditAccount: '987654321',
                transferDate: twoMonthsAgo,
            },
            // Transferencias de la Empresa C (el último mes)
            {
                amount: 4000,
                companyId: companies[2].id,
                debitAccount: '123456789',
                creditAccount: '987654321',
                transferDate: lastMonth,
            },
            // Transferencias de la Empresa D (hace dos meses)
            {
                amount: 5000,
                companyId: companies[3].id,
                debitAccount: '123456789',
                creditAccount: '987654321',
                transferDate: twoMonthsAgo,
            },
            // Transferencias de la Empresa E (hoy)
            {
                amount: 6000,
                companyId: companies[4].id,
                debitAccount: '123456789',
                creditAccount: '987654321',
                transferDate: today,
            },
        ];

        for (const transfer of transfers) {
            await this.transferRepository.save(transfer);
        }

        console.log('Transfers seeded successfully');
    }
}