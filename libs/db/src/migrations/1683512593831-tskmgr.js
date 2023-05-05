const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class tskmgr1683512593831 {
    name = 'tskmgr1683512593831'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TYPE "public"."task_status_enum" RENAME TO "task_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."task_status_enum" AS ENUM('PENDING', 'RUNNING', 'COMPLETED', 'ABORTED', 'FAILED')`);
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "status" TYPE "public"."task_status_enum" USING "status"::"text"::"public"."task_status_enum"`);
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`DROP TYPE "public"."task_status_enum_old"`);
    }

    async down(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."task_status_enum_old" AS ENUM('PENDING', 'RUNNING', 'COMPLETED', 'FAILED')`);
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "status" TYPE "public"."task_status_enum_old" USING "status"::"text"::"public"."task_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`DROP TYPE "public"."task_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."task_status_enum_old" RENAME TO "task_status_enum"`);
    }
}
