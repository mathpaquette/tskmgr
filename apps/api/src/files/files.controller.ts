import { Controller, Get, Param, Res, StreamableFile } from '@nestjs/common';
import { FilesService } from './files.service';
import { createReadStream } from 'fs';
import type { Response } from 'express';

@Controller('files')
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Get(':id')
  async getFile(
    @Param('id') fileId: number, //
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    return this.getStreamableFile(fileId, res, false);
  }

  @Get(':id/save')
  async saveFile(
    @Param('id') fileId: number, //
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    return this.getStreamableFile(fileId, res, true);
  }

  async getStreamableFile(id: number, res: Response, save: boolean): Promise<StreamableFile> {
    const file = await this.filesService.findById(id);
    const readStream = createReadStream(`./files/${file.filename}`);
    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': save ? `attachment; filename="${file.originName}"` : 'inline',
    });
    return new StreamableFile(readStream);
  }
}
