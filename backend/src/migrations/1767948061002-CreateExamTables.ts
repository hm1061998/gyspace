import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateExamTables1767948061002 implements MigrationInterface {
  name = 'CreateExamTables1767948061002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if enum exists
    const enumExists = await queryRunner.query(
      `SELECT 1 FROM pg_type WHERE typname = 'exam_questions_type_enum'`,
    );
    if (enumExists.length === 0) {
      await queryRunner.query(
        `CREATE TYPE "public"."exam_questions_type_enum" AS ENUM('MATCHING', 'MULTIPLE_CHOICE', 'FILL_BLANKS')`,
      );
    }
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "exam_papers" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5c68bb623f49d4641a518d65071" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "exam_questions" ("id" SERIAL NOT NULL, "examPaperId" integer NOT NULL, "type" "public"."exam_questions_type_enum" NOT NULL, "content" jsonb NOT NULL, "points" integer NOT NULL DEFAULT '0', "order" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a214d47c7964cb6356f413dc73c" PRIMARY KEY ("id"))`,
    );
    const fkExists = await queryRunner.query(
      `SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_f5fd60e07f3b8ecd9cf431b5b73'`,
    );
    if (fkExists.length === 0) {
      await queryRunner.query(
        `ALTER TABLE "exam_questions" ADD CONSTRAINT "FK_f5fd60e07f3b8ecd9cf431b5b73" FOREIGN KEY ("examPaperId") REFERENCES "exam_papers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "exam_questions" DROP CONSTRAINT "FK_f5fd60e07f3b8ecd9cf431b5b73"`,
    );
    await queryRunner.query(`DROP TABLE "exam_papers"`);
    await queryRunner.query(`DROP TABLE "exam_questions"`);
    await queryRunner.query(`DROP TYPE "public"."exam_questions_type_enum"`);
  }
}
