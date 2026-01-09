import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateExercisesToExamPaper1767948061003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Get all exercises
    // Check if table exists first to avoid errors if run in blank DB (though unlikely if specific migration)
    const exercises = await queryRunner.query(`SELECT * FROM "exercises"`);

    if (!exercises || exercises.length === 0) return;

    // 2. Create a new Exam Paper
    // Using parameterized query for safety
    const paperResult = await queryRunner.query(
      `
            INSERT INTO "exam_papers" ("title", "description", "createdAt", "updatedAt")
            VALUES ($1, $2, NOW(), NOW())
            RETURNING "id"
        `,
      [
        'Tổng hợp bài tập cũ',
        'Đề thi được tạo tự động từ các bài tập lẻ có sẵn trong hệ thống.',
      ],
    );

    const paperId = paperResult[0].id;

    // 3. Create Exam Questions for each exercise
    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];

      // Ensure content is in correct format (it should be an object already from SELECT)
      const content = ex.content;

      await queryRunner.query(
        `
                INSERT INTO "exam_questions" ("examPaperId", "type", "content", "points", "order", "createdAt", "updatedAt")
                VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
            `,
        [paperId, ex.type, content, ex.points || 10, i + 1],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "exam_papers" WHERE "title" = 'Tổng hợp bài tập cũ'`,
    );
  }
}
