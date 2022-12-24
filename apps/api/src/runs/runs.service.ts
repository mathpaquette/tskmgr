import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, IsNull, Repository } from 'typeorm';
import { RunEntity } from './run.entity';
import { CreateFileRequestDto, CreateRunRequestDto, SetLeaderRequestDto, SetLeaderResponseDto } from '@tskmgr/common';
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

  async close(id: number): Promise<RunEntity> {
    const run = await this.runsRepository.findOneBy({ id: id });
    run.close();
    return this.runsRepository.save(run);
  }

  async abort(id: number): Promise<RunEntity> {
    const run = await this.runsRepository.findOneBy({ id: id });
    run.abort();
    return this.runsRepository.save(run);
  }

  async fail(id: number): Promise<RunEntity> {
    const run = await this.runsRepository.findOneBy({ id: id });
    run.fail();
    return this.runsRepository.save(run);
  }

  async setLeader(runId: number, setLeaderRequestDto: SetLeaderRequestDto): Promise<SetLeaderResponseDto> {
    // TODO: set lock
    const { runnerId } = setLeaderRequestDto;
    const run = await this.runsRepository.findOneBy([
      {
        id: runId,
        leaderId: IsNull(),
      },
      {
        id: runId,
        leaderId: runnerId,
      },
    ]);

    if (run) {
      run.leaderId = runnerId;
      await this.runsRepository.save(run);
    }

    return { leader: !!run, run: run };
  }

  async findById(runId: number): Promise<RunEntity> {
    return this.runsRepository.findOne({
      where: { id: runId },
      relations: {
        tasks: true,
        files: true,
      },
    });
  }

  async findAll(search: string): Promise<RunEntity[]> {
    return this.runsRepository.find({
      where: search ? { name: ILike(`%${search}%`) } : {},
      order: { id: 'DESC' },
      take: 100,
    });
  }
}
