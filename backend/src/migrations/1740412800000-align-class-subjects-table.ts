import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Aligns the class_subjects join table with the many-to-many mapping that the application
 * actually uses. Historical versions of the schema added additional columns (academic_year,
 * term, teacher_id, timestamps) which are not managed by TypeORM. During schema sync TypeORM
 * attempted to drop the enum-backed column, triggering a "cannot drop type term_enum" error
 * because other tables (e.g. class_schedule) still depend on the shared enum type.
 *
 * This migration removes the unused columns so that the join table matches the entity
 * definition and TypeORM no longer attempts to mutate the shared enum type.
 */
export class AlignClassSubjectsTable1740412800000
  implements MigrationInterface
{
  name = 'AlignClassSubjectsTable1740412800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure there is at most one row per (class_id, subject_id) before shrinking the PK.
    await queryRunner.query(`
      WITH ranked AS (
        SELECT
          ctid,
          ROW_NUMBER() OVER (
            PARTITION BY class_id, subject_id
            ORDER BY ctid
          ) AS rn
        FROM class_subjects
      )
      DELETE FROM class_subjects
      WHERE ctid IN (SELECT ctid FROM ranked WHERE rn > 1);
    `);

    await queryRunner.query(
      `ALTER TABLE "class_subjects" DROP CONSTRAINT IF EXISTS "class_subjects_pkey";`,
    );
    await queryRunner.query(
      `ALTER TABLE "class_subjects" DROP CONSTRAINT IF EXISTS "class_subjects_teacher_id_fkey";`,
    );

    await queryRunner.query(
      `ALTER TABLE "class_subjects" DROP COLUMN IF EXISTS "teacher_id";`,
    );
    await queryRunner.query(
      `ALTER TABLE "class_subjects" DROP COLUMN IF EXISTS "academic_year";`,
    );
    await queryRunner.query(
      `ALTER TABLE "class_subjects" DROP COLUMN IF EXISTS "term";`,
    );
    await queryRunner.query(
      `ALTER TABLE "class_subjects" DROP COLUMN IF EXISTS "created_at";`,
    );
    await queryRunner.query(
      `ALTER TABLE "class_subjects" DROP COLUMN IF EXISTS "updated_at";`,
    );

    await queryRunner.query(
      `ALTER TABLE "class_subjects" ADD CONSTRAINT "class_subjects_pkey" PRIMARY KEY ("class_id", "subject_id");`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "class_subjects" DROP CONSTRAINT IF EXISTS "class_subjects_pkey";`,
    );

    await queryRunner.query(
      `ALTER TABLE "class_subjects" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ DEFAULT NOW();`,
    );
    await queryRunner.query(
      `ALTER TABLE "class_subjects" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ DEFAULT NOW();`,
    );
    await queryRunner.query(
      `ALTER TABLE "class_subjects" ADD COLUMN IF NOT EXISTS "academic_year" VARCHAR(20) NOT NULL DEFAULT 'UNKNOWN';`,
    );
    await queryRunner.query(
      `ALTER TABLE "class_subjects" ADD COLUMN IF NOT EXISTS "term" term_enum NOT NULL DEFAULT 'FIRST_TERM';`,
    );
    await queryRunner.query(
      `ALTER TABLE "class_subjects" ADD COLUMN IF NOT EXISTS "teacher_id" UUID;`,
    );

    await queryRunner.query(`
      ALTER TABLE "class_subjects"
      ADD CONSTRAINT "class_subjects_teacher_id_fkey"
        FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE SET NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE "class_subjects"
      ADD CONSTRAINT "class_subjects_pkey"
        PRIMARY KEY ("class_id", "subject_id", "academic_year", "term");
    `);

    await queryRunner.query(
      `ALTER TABLE "class_subjects" ALTER COLUMN "academic_year" DROP DEFAULT;`,
    );
    await queryRunner.query(
      `ALTER TABLE "class_subjects" ALTER COLUMN "term" DROP DEFAULT;`,
    );
  }
}
