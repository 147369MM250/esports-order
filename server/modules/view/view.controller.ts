import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';

@Controller()
export class ViewController {
  @Get(['/', '/admin/(.*)', '/products/(.*)', '/product/(.*)', '/payment/(.*)', '/orders/(.*)'])
  render(@Res() res: Response) {
    res.sendFile(join(process.cwd(), 'dist/client/index.html'));
  }
}
