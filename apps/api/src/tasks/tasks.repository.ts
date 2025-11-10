import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TaskEntity } from './task.entity';
import { TaskStatus } from '@tskmgr/common';

@Injectable()
export class TasksRepository extends Repository<TaskEntity> {
  constructor(dataSource: DataSource) {
    super(TaskEntity, dataSource.createEntityManager());
  }

  public async calculateAvgTaskDuration(hash: string): Promise<number> {
    const result = await this.createQueryBuilder()
      .select('AVG(t.duration)', 'avgDuration')
      .from((subQuery) => {
        return subQuery
          .select('task.duration', 'duration')
          .from(TaskEntity, 'task')
          .where('task.hash = :hash', { hash })
          .andWhere('task.status = :status', { status: TaskStatus.Completed })
          .andWhere('task.cached = :cached', { cached: false })
          .orderBy('task.endedAt', 'DESC')
          .limit(10); // TODO: make it configurable
      }, 't')
      .getRawOne();

    return result.avgDuration;
  }

  public async getAvgDurationsByHash(hashes: string[]): Promise<Map<string, number>> {
    const results = await this.createQueryBuilder('task')
      .select(['task.hash AS hash', 'task.avgDuration AS "avgDuration"'])
      .where('task.hash IN (:...hashes)', { hashes })
      // .andWhere('task.status = :status', { status: TaskStatus.Completed })
      .orderBy('task.hash')
      .addOrderBy('task.endedAt', 'DESC')
      .distinctOn(['task.hash'])
      .getRawMany<{ hash: string; avgDuration: number }>();

    return new Map(results.map(({ hash, avgDuration }) => [hash, avgDuration]));
  }

  public async getAvgDurationsByHashNew(hashes: string[]): Promise<Map<string, number>> {
    const results = await this.manager.query(
      `
    SELECT hash, AVG(duration) AS "avgDuration"
    FROM (
      SELECT hash, duration,
             ROW_NUMBER() OVER (PARTITION BY hash ORDER BY ended_at DESC) AS rn
      FROM task
      WHERE hash = ANY($1)
        AND status = $2
        AND cached = false
    ) sub
    WHERE rn <= 10
    GROUP BY hash
    `,
      [hashes, TaskStatus.Completed]
    );

    return new Map(results.map(({ hash, avgDuration }) => [hash, avgDuration]));
  }
}
