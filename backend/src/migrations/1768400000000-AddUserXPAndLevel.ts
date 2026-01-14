import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserXPAndLevel1768400000000 implements MigrationInterface {
  name = 'AddUserXPAndLevel1768400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add xp and level columns to users table
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "xp" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "level" integer NOT NULL DEFAULT 1`,
    );

    // Also check for idiom_comments columns just in case
    await queryRunner.query(
      `ALTER TABLE "idiom_comments" ADD COLUMN IF NOT EXISTS "reportCount" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "idiom_comments" ADD COLUMN IF NOT EXISTS "processedAt" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "idiom_comments" DROP COLUMN "processedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "idiom_comments" DROP COLUMN "reportCount"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "level"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "xp"`);
  }
}
