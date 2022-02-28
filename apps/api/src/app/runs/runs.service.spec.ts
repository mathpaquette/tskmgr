import { Test, TestingModule } from '@nestjs/testing';
import { RunsService } from './runs.service';

xdescribe('RunsService', () => {
  let service: RunsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RunsService],
    }).compile();

    service = module.get<RunsService>(RunsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
