import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TaskEntity } from './task.entity';
import { TaskStatus } from '@tskmgr/common';

@Injectable()
export class TasksRepository extends Repository<TaskEntity> {
  constructor(dataSource: DataSource) {
    super(TaskEntity, dataSource.createEntityManager());
  }

  public async getAvgDurationsByHash(hashes: string[]): Promise<Map<string, number>> {
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
