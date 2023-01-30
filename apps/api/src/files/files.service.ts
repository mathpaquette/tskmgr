import { Injectable } from '@nestjs/common';
import { FileEntity } from './file.entity';

@Injectable()
export class FilesService {
  public findById(id: number): Promise<FileEntity> {
    return null;
  }
}
