import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RunEntity } from './run.entity';
import { CreateFileRequestDto, CreateRunRequestDto } from '@tskmgr/common';
import { FileEntity } from '../files/file.entity';
import { Express } from 'express';

@Injectable()
export class RunsService {
  constructor(
    @InjectRepository(RunEntity) private readonly runsRepository: Repository<RunEntity>,
    @InjectRepository(FileEntity) private readonly filesRepository: Repository<FileEntity>
  ) {}

  async createRun(createRunDto: CreateRunRequestDto): Promise<RunEntity> {
    const runEntity = this.runsRepository.create({
      name: createRunDto.name,
      type: createRunDto.type,
      url: createRunDto.url,
      parameters: createRunDto.parameters,
      prioritization: createRunDto.prioritization,
      affinity: createRunDto.affinity,
      failFast: createRunDto.failFast,
    });

    return this.runsRepository.save(runEntity);
  }

  async createFile(
    runId: number,
    file: Express.Multer.File,
    createFileRequestDto: CreateFileRequestDto
  ): Promise<FileEntity> {
    const run = await this.runsRepository.findOneBy({ id: runId });
    if (!run) {
      throw new Error(`Unable run find run id: ${runId}`);
    }

    const fileEntity = this.filesRepository.create({
      run: run,
      status: createFileRequestDto.status,
      description: createFileRequestDto.description,
      originName: file.originalname,
      filename: file.filename,
      mimeType: file.mimetype,
    });

    return this.filesRepository.save(fileEntity);
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
  async findById(id: number): Promise<RunEntity> {
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
