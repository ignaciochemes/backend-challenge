import { MigrationInterface, QueryRunner } from "typeorm";

export class EnhancedEntities1746506789193 implements MigrationInterface {
    name = 'EnhancedEntities1746506789193'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transfer" DROP CONSTRAINT "FK_d0caba9ccb42347318bd36cf9fc"`);
        await queryRunner.query(`ALTER TABLE "company" ADD "uuid" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "company" ADD "address" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "company" ADD "contact_email" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "company" ADD "contact_phone" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "company" ADD "is_active" boolean DEFAULT true`);
        await queryRunner.query(`CREATE TYPE "public"."transfer_status_enum" AS ENUM('pending', 'completed', 'failed', 'reversed')`);
        await queryRunner.query(`ALTER TABLE "transfer" ADD "status" "public"."transfer_status_enum" NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "transfer" ADD "description" text`);
        await queryRunner.query(`ALTER TABLE "transfer" ADD "reference_id" text`);
        await queryRunner.query(`ALTER TABLE "transfer" ADD "processed_date" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "transfer" ADD "currency" character varying(50) DEFAULT 'ARS'`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_3fa0b2af99d910864a56bb10c9" ON "company" ("uuid") `);
        await queryRunner.query(`ALTER TABLE "transfer" ADD CONSTRAINT "FK_d0caba9ccb42347318bd36cf9fc" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transfer" DROP CONSTRAINT "FK_d0caba9ccb42347318bd36cf9fc"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3fa0b2af99d910864a56bb10c9"`);
        await queryRunner.query(`ALTER TABLE "transfer" DROP COLUMN "currency"`);
        await queryRunner.query(`ALTER TABLE "transfer" DROP COLUMN "processed_date"`);
        await queryRunner.query(`ALTER TABLE "transfer" DROP COLUMN "reference_id"`);
        await queryRunner.query(`ALTER TABLE "transfer" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "transfer" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."transfer_status_enum"`);
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "contact_phone"`);
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "contact_email"`);
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "uuid"`);
        await queryRunner.query(`ALTER TABLE "transfer" ADD CONSTRAINT "FK_d0caba9ccb42347318bd36cf9fc" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
