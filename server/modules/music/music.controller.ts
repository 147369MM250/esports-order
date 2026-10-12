import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { MusicService } from './music.service';

@Controller('api/music')
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  @Get('proxy')
  async proxy(@Query('id') id: string, @Res() res: Response) {
    return this.musicService.proxySong(id, res);
  }
}
