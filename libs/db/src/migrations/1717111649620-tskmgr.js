const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class Tskmgr1717111649620 {
    name = 'Tskmgr1717111649620'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "task" ADD "dependsOn" text NOT NULL DEFAULT ''`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "dependsOn"`);
    }
}
