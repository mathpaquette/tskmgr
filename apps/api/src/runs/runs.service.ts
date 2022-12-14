import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Run } from './run.entity';
import { CreateRunRequestDto } from '@tskmgr/common';

@Injectable()
export class RunsService {
  constructor(@InjectRepository(Run) private readonly runsRepository: Repository<Run>) {}

  async create(createRunDto: CreateRunRequestDto): Promise<Run> {
    const run = this.runsRepository.create({
      name: createRunDto.name,
      type: createRunDto.type,
      url: createRunDto.url,
      parameters: createRunDto.parameters,
      prioritization: createRunDto.prioritization,
      affinity: createRunDto.affinity,
      failFast: createRunDto.failFast,
    });

    return this.runsRepository.save(run);
  }

  //
  // async close(id: string): Promise<Run> {
  //   const run = await this.runModel.findById(id).exec();
  //   return run.close().save();
  // }
  //
  // async abort(id: string): Promise<Run> {
  //   const run = await this.runModel.findById(id).exec();
  //   return run.abort().save();
  // }
  //
  // async fail(id: string): Promise<Run> {
  //   const run = await this.runModel.findById(id).exec();
  //   return run.fail().save();
  // }
  //
  // async setLeader(id: string, setLeaderRequestDto: SetLeaderRequestDto): Promise<SetLeaderResponseDto> {
  //   const { runnerId } = setLeaderRequestDto;
  //   const run = await this.runModel.findOneAndUpdate(
  //     {
  //       _id: id,
  //       $or: [{ leaderId: { $exists: false } }, { leaderId: runnerId }],
  //     },
  //     { $set: { leaderId: runnerId } },
  //     { new: true }
  //   );
  //
  //   return { isLeader: !!run, run: run };
  // }
  //
  async findById(id: number): Promise<Run> {
    return this.runsRepository.findOneBy({ id: id });
  }
  //
  // async findAll(): Promise<Run[]> {
  //   return this.runModel
  //     .find() //
  //     .sort({ updatedAt: -1 })
  //     .limit(100)
  //     .exec();
  // }
  //
  // async hasAllTasksCompleted(run: Run): Promise<boolean> {
  //   const allTasks = await this.taskModel.find({ run: { _id: run._id } });
  //   const completedTasks = await this.taskModel.find({ run: { _id: run._id }, status: TaskStatus.Completed });
  //   return allTasks.length === completedTasks.length;
  // }
}
