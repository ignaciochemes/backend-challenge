import { MigrationInterface, QueryRunner } from "typeorm";

export class FirstMigration1746483727668 implements MigrationInterface {
    name = 'FirstMigration1746483727668'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "company" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" SERIAL NOT NULL, "cuit" character varying(50) NOT NULL, "business_name" character varying(50) NOT NULL, "adhesion_date" TIMESTAMP NOT NULL, CONSTRAINT "PK_056f7854a7afdba7cbd6d45fc20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "transfer" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" SERIAL NOT NULL, "uuid" uuid NOT NULL, "amount" numeric(10,2) NOT NULL DEFAULT '0', "debit_account" character varying(50) NOT NULL, "credit_account" character varying(50) NOT NULL, "transfer_date" TIMESTAMP NOT NULL, "company_id" integer, CONSTRAINT "PK_fd9ddbdd49a17afcbe014401295" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_887620e2c3f2a45811a4a8e286" ON "transfer" ("uuid") `);
        await queryRunner.query(`ALTER TABLE "transfer" ADD CONSTRAINT "FK_d0caba9ccb42347318bd36cf9fc" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transfer" DROP CONSTRAINT "FK_d0caba9ccb42347318bd36cf9fc"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_887620e2c3f2a45811a4a8e286"`);
        await queryRunner.query(`DROP TABLE "transfer"`);
        await queryRunner.query(`DROP TABLE "company"`);
    }

}
