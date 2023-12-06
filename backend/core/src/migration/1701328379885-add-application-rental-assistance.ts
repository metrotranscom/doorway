import { MigrationInterface, QueryRunner } from "typeorm"

export class addApplicationRentalAssistance1701328379885 implements MigrationInterface {
  name = "addApplicationRentalAssistance1701328379885"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "applications" ADD "rental_assistance" boolean NOT NULL DEFAULT false`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "applications" DROP COLUMN "rental_assistance"`
    )
  }
}
