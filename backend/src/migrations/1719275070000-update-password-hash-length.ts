import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePasswordHashLength1719275070000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE users ALTER COLUMN password_hash TYPE varchar(255)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert to the original length if needed
    await queryRunner.query(
      'ALTER TABLE users ALTER COLUMN password_hash TYPE varchar(100)',
    );
  }
}
