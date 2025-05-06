import { MigrationInterface, QueryRunner } from "typeorm";

export class EnhancedEntities1746492372313 implements MigrationInterface {
    name = 'EnhancedEntities1746492372313'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company" ADD "uuid" uuid NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_company_uuid" ON "company" ("uuid") `);
        await queryRunner.query(`ALTER TABLE "company" ADD "address" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "company" ADD "contact_email" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "company" ADD "contact_phone" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "company" ADD "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "company" ADD CONSTRAINT "CHK_company_cuit" CHECK ("cuit" ~ '^(20|23|24|25|26|27|30|33|34)(-)?[0-9]{8}(-)?[0-9]$')`);
        await queryRunner.query(`
            CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
            UPDATE "company" SET "uuid" = uuid_generate_v4() WHERE "uuid" IS NULL;
        `);
        await queryRunner.query(`ALTER TABLE "transfer" ADD "status" character varying(20) NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "transfer" ADD "description" text`);
        await queryRunner.query(`ALTER TABLE "transfer" ADD "reference_id" text`);
        await queryRunner.query(`ALTER TABLE "transfer" ADD "processed_date" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "transfer" ADD "currency" character varying(3) NOT NULL DEFAULT 'ARS'`);
        await queryRunner.query(`ALTER TABLE "transfer" ADD CONSTRAINT "CHK_transfer_amount" CHECK ("amount" > 0)`);
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transfer_status_enum') THEN
                    CREATE TYPE transfer_status_enum AS ENUM ('pending', 'completed', 'failed', 'reversed');
                END IF;
            END
            $$;
        `);
        await queryRunner.query(`
            ALTER TABLE "transfer" 
            ALTER COLUMN "status" TYPE transfer_status_enum 
            USING status::transfer_status_enum;
        `);
        await queryRunner.query(`CREATE INDEX "IDX_transfer_status" ON "transfer" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_transfer_date" ON "transfer" ("transfer_date") `);
        await queryRunner.query(`CREATE INDEX "IDX_company_adhesion_date" ON "company" ("adhesion_date") `);
        await queryRunner.query(`CREATE INDEX "IDX_company_cuit" ON "company" ("cuit") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_company_cuit"`);
        await queryRunner.query(`DROP INDEX "IDX_company_adhesion_date"`);
        await queryRunner.query(`DROP INDEX "IDX_transfer_date"`);
        await queryRunner.query(`DROP INDEX "IDX_transfer_status"`);
        await queryRunner.query(`DROP INDEX "IDX_company_uuid"`);
        await queryRunner.query(`ALTER TABLE "transfer" DROP CONSTRAINT "CHK_transfer_amount"`);
        await queryRunner.query(`ALTER TABLE "company" DROP CONSTRAINT "CHK_company_cuit"`);
        await queryRunner.query(`
            ALTER TABLE "transfer" 
            ALTER COLUMN "status" TYPE character varying(20);
        `);
        await queryRunner.query(`DROP TYPE IF EXISTS transfer_status_enum`);
        await queryRunner.query(`ALTER TABLE "transfer" DROP COLUMN "currency"`);
        await queryRunner.query(`ALTER TABLE "transfer" DROP COLUMN "processed_date"`);
        await queryRunner.query(`ALTER TABLE "transfer" DROP COLUMN "reference_id"`);
        await queryRunner.query(`ALTER TABLE "transfer" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "transfer" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "contact_phone"`);
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "contact_email"`);
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "uuid"`);
    }
}