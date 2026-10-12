import { Controller, Get, Put, Body } from '@nestjs/common';
import { SettingsService } from './settings.service';
import type { SystemSettings, UpdateSettingsDto } from '@shared/api.interface';

@Controller('api/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings(): Promise<SystemSettings> {
    return this.settingsService.getSettings();
  }

  @Put()
  async updateSettings(@Body() dto: UpdateSettingsDto): Promise<SystemSettings> {
    return this.settingsService.updateSettings(dto);
  }
}
