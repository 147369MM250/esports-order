import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { UploadService } from './upload.service';
import type { UploadResponse } from '@shared/api.interface';

@Controller('api/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @HttpCode(HttpStatus.OK)
  async uploadImage(@Body() body: { base64: string; filename?: string }): Promise<UploadResponse> {
    if (!body.base64) {
      throw new BadRequestException('缺少图片数据');
    }
    return this.uploadService.uploadImage(body.base64, body.filename);
  }
}
