import { MigrationInterface, QueryRunner } from 'typeorm';

export class OptimizedSearchIndices1768000000000 implements MigrationInterface {
  name = 'OptimizedSearchIndices1768000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable pg_trgm extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);

    // Create GIN indices for trigram search
    // We use gin_trgm_ops for text columns
    await queryRunner.query(
      `CREATE INDEX "IDX_IDIOMS_HANZI_TRGM" ON "idioms" USING GIN ("hanzi" gin_trgm_ops)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_IDIOMS_PINYIN_TRGM" ON "idioms" USING GIN ("pinyin" gin_trgm_ops)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_IDIOMS_MEANING_TRGM" ON "idioms" USING GIN ("vietnameseMeaning" gin_trgm_ops)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_IDIOMS_MEANING_TRGM"`);
    await queryRunner.query(`DROP INDEX "IDX_IDIOMS_PINYIN_TRGM"`);
    await queryRunner.query(`DROP INDEX "IDX_IDIOMS_HANZI_TRGM"`);
    // We don't drop pg_trgm extension to avoid breaking other potential uses
  }
}
