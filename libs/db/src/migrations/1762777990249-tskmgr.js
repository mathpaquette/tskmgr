const { MigrationInterface, QueryRunner } = require('typeorm');
const { schema } = require('../lib/data-source').AppDataSource.options;

module.exports = class Tskmgr1762777990249 {
  name = 'Tskmgr1762777990249';

  async up(queryRunner) {
    await queryRunner.query(`SET search_path TO ${schema}`);
    await queryRunner.query(`ALTER TABLE "task" RENAME COLUMN "dependsOn" TO "dependencies"`);
    await queryRunner.query(`ALTER TABLE "task" ADD "hash" character varying(44)`);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_da2fb68519fa0bcf5a0c6e7ace" ON "task" ("run_id", "name") `);
    await queryRunner.query(`CREATE INDEX "IDX_task_hash_ended_at_desc" ON "task" ("hash", "ended_at" DESC)`);
  }

  async down(queryRunner) {
    await queryRunner.query(`SET search_path TO ${schema}`);
    await queryRunner.query(`DROP INDEX "IDX_task_hash_ended_at_desc"`);
    await queryRunner.query(`DROP INDEX "IDX_da2fb68519fa0bcf5a0c6e7ace"`);
    await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "hash"`);
    await queryRunner.query(`ALTER TABLE "task" RENAME COLUMN "dependencies" TO "dependsOn"`);
  }
};
