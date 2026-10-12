import { Injectable } from '@nestjs/common';
import type { UploadResponse } from '@shared/api.interface';

@Injectable()
export class UploadService {
  async uploadImage(base64: string, filename?: string): Promise<UploadResponse> {
    const dataUrl = base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`;
    return { url: dataUrl };
  }
}
