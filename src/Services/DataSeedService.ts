import * as path from 'path';
import * as fs from 'fs';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransferStatus } from 'src/Enums/TransferStatusEnum';
import { Company } from 'src/Models/Entities/CompanyEntity';
import { Transfer } from 'src/Models/Entities/TransferEntity';

@Injectable()
export class DataSeederService implements OnModuleInit {
    private readonly _logger = new Logger(DataSeederService.name);
    constructor(
        @InjectRepository(Company)
        private readonly companyRepository: Repository<Company>,
        @InjectRepository(Transfer)
        private readonly transferRepository: Repository<Transfer>,
    ) { }

    async onModuleInit() {
        try {
            const count = await this.companyRepository.count();
            if (count === 0) {
                this._logger.log('No data found in database. Starting seed process...');
                await this._seedData();
            } else {
                this._logger.log('Database already contains data. Skipping seed process.');
            }
        } catch (error) {
            this._logger.error(`Error checking database: ${error.message}`, error.stack);
        }
    }

    private async _seedData() {
        try {
            const seedDataPath = path.resolve(__dirname, '../../seed-data.json');
            this._logger.log(`Reading seed data from: ${seedDataPath}`);
            let seedData;
            try {
                const fileContents = fs.readFileSync(seedDataPath, 'utf8');
                seedData = JSON.parse(fileContents);
            } catch (fileError) {
                this._logger.error(`Failed to read seed data file: ${fileError.message}`, fileError.stack);
                this._logger.log('Using fallback seed data...');
                seedData = this._getFallbackSeedData();
            }
            this._logger.log(`Seeding ${seedData.companies.length} companies...`);
            const companyMap = new Map<string, Company>();
            for (const companyData of seedData.companies) {
                try {
                    const company = new Company();
                    company.setUuid(companyData.uuid);
                    company.setCuit(companyData.cuit);
                    company.setBusinessName(companyData.businessName);
                    company.setAdhesionDate(new Date(companyData.adhesionDate));
                    if (companyData.address) company.setAddress(companyData.address);
                    if (companyData.contactEmail) company.setContactEmail(companyData.contactEmail);
                    if (companyData.contactPhone) company.setContactPhone(companyData.contactPhone);
                    company.setIsActive(companyData.isActive ?? true);

                    const savedCompany = await this.companyRepository.save(company);
                    companyMap.set(savedCompany.getUuid(), savedCompany);
                    this._logger.debug(`Seeded company: ${savedCompany.getBusinessName()}`);
                } catch (error) {
                    this._logger.error(`Error seeding company ${companyData.businessName}: ${error.message}`, error.stack);
                }
            }
            this._logger.log(`Seeding ${seedData.transfers.length} transfers...`);
            for (const transferData of seedData.transfers) {
                try {
                    const company = companyMap.get(transferData.companyUuid);
                    if (!company) {
                        this._logger.warn(`Company with UUID ${transferData.companyUuid} not found for transfer ${transferData.uuid}`);
                        continue;
                    }
                    const transfer = new Transfer();
                    transfer.setUuid(transferData.uuid);
                    transfer.setAmount(transferData.amount);
                    transfer.setCompanyId(company);
                    transfer.setDebitAccount(transferData.debitAccount);
                    transfer.setCreditAccount(transferData.creditAccount);
                    transfer.setTransferDate(new Date(transferData.transferDate));
                    transfer.setStatus(transferData.status as TransferStatus);
                    if (transferData.description) transfer.setDescription(transferData.description);
                    if (transferData.referenceId) transfer.setReferenceId(transferData.referenceId);
                    if (transferData.processedDate) transfer.setProcessedDate(new Date(transferData.processedDate));
                    if (transferData.currency) transfer.setCurrency(transferData.currency);
                    await this.transferRepository.save(transfer);
                    this._logger.debug(`Seeded transfer: ${transfer.getUuid()} for company ${company.getBusinessName()}`);
                } catch (error) {
                    this._logger.error(`Error seeding transfer ${transferData.uuid}: ${error.message}`, error.stack);
                }
            }
            this._logger.log('Seed process completed successfully');
        } catch (error) {
            this._logger.error(`Error during seed process: ${error.message}`, error.stack);
        }
    }

    private _getFallbackSeedData() {
        const today = new Date();
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, today.getDate());
        return {
            companies: [
                {
                    uuid: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
                    cuit: "30-71659554-9",
                    businessName: "TechSolutions SA",
                    adhesionDate: lastMonth.toISOString(),
                    address: "Av. Corrientes 1234, CABA",
                    contactEmail: "info@techsolutions.com",
                    contactPhone: "11-4567-8901",
                    isActive: true
                },
                {
                    uuid: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
                    cuit: "30-71123456-7",
                    businessName: "Constructora del Sur SRL",
                    adhesionDate: lastMonth.toISOString(),
                    address: "Av. Rivadavia 9876, CABA",
                    contactEmail: "contacto@constructoradelsur.com",
                    contactPhone: "11-2345-6789",
                    isActive: true
                },
                {
                    uuid: "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
                    cuit: "30-70987654-3",
                    businessName: "Distribuidora Norte SA",
                    adhesionDate: twoMonthsAgo.toISOString(),
                    address: "Av. San Martín 4567, Córdoba",
                    contactEmail: "ventas@disnorte.com",
                    contactPhone: "351-456-7890",
                    isActive: true
                }
            ],
            transfers: [
                {
                    uuid: "550e8400-e29b-41d4-a716-446655440000",
                    amount: 25000.50,
                    companyUuid: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
                    debitAccount: "123456789012",
                    creditAccount: "098765432109",
                    transferDate: lastMonth.toISOString(),
                    status: "completed",
                    description: "Pago de servicios IT mensuales",
                    referenceId: "REF-IT-20250420",
                    processedDate: lastMonth.toISOString(),
                    currency: "ARS"
                },
                {
                    uuid: "550e8400-e29b-41d4-a716-446655440002",
                    amount: 35000.00,
                    companyUuid: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
                    debitAccount: "234567890123",
                    creditAccount: "456789012345",
                    transferDate: lastMonth.toISOString(),
                    status: "completed",
                    description: "Pago de materiales de construcción",
                    referenceId: "REF-MAT-20250422",
                    processedDate: lastMonth.toISOString(),
                    currency: "ARS"
                },
                {
                    uuid: "550e8400-e29b-41d4-a716-446655440004",
                    amount: 42000.00,
                    companyUuid: "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
                    debitAccount: "345678901234",
                    creditAccount: "678901234567",
                    transferDate: twoMonthsAgo.toISOString(),
                    status: "completed",
                    description: "Pago a proveedores mayoristas",
                    referenceId: "REF-MAY-20250310",
                    processedDate: twoMonthsAgo.toISOString(),
                    currency: "ARS"
                }
            ]
        };
    }
}