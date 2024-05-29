const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class tskmgr1717030423134 {
    name = 'tskmgr1717030423134'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "run" DROP COLUMN "affinity"`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "run" ADD "affinity" boolean NOT NULL DEFAULT false`);
    }
}
