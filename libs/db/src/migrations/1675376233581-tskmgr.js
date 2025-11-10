const { MigrationInterface, QueryRunner } = require('typeorm');
const { schema } = require('../lib/data-source').AppDataSource.options;

module.exports = class tskmgr1675376233581 {
  name = 'tskmgr1675376233581';

  async up(queryRunner) {
    await queryRunner.query(`SET search_path TO ${schema}`);
    await queryRunner.query(`CREATE TYPE "run_status_enum" AS ENUM('CREATED', 'STARTED', 'ABORTED', 'FAILED', 'COMPLETED')`);
    await queryRunner.query(`CREATE TABLE "run" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "type" character varying NOT NULL, "closed" boolean NOT NULL DEFAULT false, "url" character varying, "fail_fast" boolean NOT NULL DEFAULT true, "leader_id" character varying, "prioritization" text NOT NULL DEFAULT 'LONGEST', "info" jsonb, "parameters" jsonb, "affinity" boolean NOT NULL DEFAULT false, "duration" real, "status" "run_status_enum" NOT NULL DEFAULT 'CREATED', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "ended_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_cc57fcee07868cfdd728d9ac17e" UNIQUE ("name"), CONSTRAINT "PK_804c38ffba92002c6d2c646dd46" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TYPE "task_status_enum" AS ENUM('PENDING', 'RUNNING', 'COMPLETED', 'FAILED')`);
    await queryRunner.query(`CREATE TYPE "task_priority_enum" AS ENUM('NEWEST', 'OLDEST', 'LONGEST', 'SHORTEST')`);
    await queryRunner.query(`CREATE TABLE "task" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "type" character varying NOT NULL, "command" character varying NOT NULL, "arguments" text, "options" jsonb, "runner_id" character varying, "runner_info" jsonb, "status" "task_status_enum" NOT NULL DEFAULT 'PENDING', "cached" boolean, "duration" real, "avg_duration" real, "priority" "task_priority_enum" NOT NULL DEFAULT 'LONGEST', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "started_at" TIMESTAMP WITH TIME ZONE, "ended_at" TIMESTAMP WITH TIME ZONE, "run_id" integer NOT NULL, CONSTRAINT "PK_fb213f79ee45060ba925ecd576e" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE INDEX "IDX_36326cc52f4708f36ae4e6158c" ON "task" ("run_id") `);
    await queryRunner.query(`CREATE TABLE "file" ("id" SERIAL NOT NULL, "description" character varying, "type" character varying, "origin_name" character varying NOT NULL, "filename" character varying NOT NULL, "mime_type" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "run_id" integer NOT NULL, "task_id" integer, CONSTRAINT "PK_36b46d232307066b3a2c9ea3a1d" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE INDEX "IDX_2d682198c6b8ebcf0539273ba0" ON "file" ("run_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_8d6894434dbc389d6047dc1cc7" ON "file" ("task_id") `);
    await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_36326cc52f4708f36ae4e6158cc" FOREIGN KEY ("run_id") REFERENCES "run"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "file" ADD CONSTRAINT "FK_2d682198c6b8ebcf0539273ba04" FOREIGN KEY ("run_id") REFERENCES "run"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "file" ADD CONSTRAINT "FK_8d6894434dbc389d6047dc1cc77" FOREIGN KEY ("task_id") REFERENCES "task"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  async down(queryRunner) {
    await queryRunner.query(`SET search_path TO ${schema}`);
    await queryRunner.query(`ALTER TABLE "file" DROP CONSTRAINT "FK_8d6894434dbc389d6047dc1cc77"`);
    await queryRunner.query(`ALTER TABLE "file" DROP CONSTRAINT "FK_2d682198c6b8ebcf0539273ba04"`);
    await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_36326cc52f4708f36ae4e6158cc"`);
    await queryRunner.query(`DROP INDEX "IDX_8d6894434dbc389d6047dc1cc7"`);
    await queryRunner.query(`DROP INDEX "IDX_2d682198c6b8ebcf0539273ba0"`);
    await queryRunner.query(`DROP TABLE "file"`);
    await queryRunner.query(`DROP INDEX "IDX_36326cc52f4708f36ae4e6158c"`);
    await queryRunner.query(`DROP TABLE "task"`);
    await queryRunner.query(`DROP TYPE "task_priority_enum"`);
    await queryRunner.query(`DROP TYPE "task_status_enum"`);
    await queryRunner.query(`DROP TABLE "run"`);
    await queryRunner.query(`DROP TYPE "run_status_enum"`);
  }
};
