import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE_DATABASE } from '../../database/database.module';
import { systemSettings } from '../../database/schema';
import type { SystemSettings, UpdateSettingsDto } from '@shared/api.interface';

const KEY_MAP: Record<keyof SystemSettings, string> = {
  siteName: 'site_name',
  siteSubtitle: 'site_subtitle',
  homeTitle: 'home_title',
  homeSubtitle: 'home_subtitle',
  statOrders: 'stat_orders',
  statGoodRate: 'stat_good_rate',
  statAvgTime: 'stat_avg_time',
  paymentQrUrl: 'payment_qr_url',
  serviceQrUrl: 'service_qr_url',
  logoUrl: 'logo_url',
  avatarUrl: 'avatar_url',
  musicIconUrl: 'music_icon_url',
  welcomePopupEnabled: 'welcome_popup_enabled',
  welcomePopupTitle: 'welcome_popup_title',
  welcomePopupContent: 'welcome_popup_content',
  welcomePopupButtonText: 'welcome_popup_button_text',
};

@Injectable()
export class SettingsService {
  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  async getSettings(): Promise<SystemSettings> {
    const rows = await this.db.select().from(systemSettings);
    const map = new Map<string, string>();
    for (const row of rows) {
      map.set(row.settingKey, row.settingValue || '');
    }

    return {
      siteName: map.get('site_name') || '电竞点单',
      siteSubtitle: map.get('site_subtitle') || '专业代练·极速上分',
      homeTitle: map.get('home_title') || '荣耀之路 · 即刻启程',
      homeSubtitle: map.get('home_subtitle') || '顶尖电竞服务平台，让你的游戏之旅更加精彩',
      statOrders: map.get('stat_orders') || '9999',
      statGoodRate: map.get('stat_good_rate') || '99.8%',
      statAvgTime: map.get('stat_avg_time') || '5分钟',
      paymentQrUrl: map.get('payment_qr_url') || '',
      serviceQrUrl: map.get('service_qr_url') || '',
      logoUrl: map.get('logo_url') || '',
      avatarUrl: map.get('avatar_url') || '',
      musicIconUrl: map.get('music_icon_url') || '',
      welcomePopupEnabled: map.get('welcome_popup_enabled') === 'true',
      welcomePopupTitle: map.get('welcome_popup_title') || '欢迎来到电竞点单',
      welcomePopupContent: map.get('welcome_popup_content') || '专业代练服务，安全可靠，极速完成！',
      welcomePopupButtonText: map.get('welcome_popup_button_text') || '立即体验',
    };
  }

  async updateSettings(dto: UpdateSettingsDto): Promise<SystemSettings> {
    const entries = Object.entries(dto) as [keyof SystemSettings, unknown][];

    for (const [key, value] of entries) {
      if (value === undefined) continue;
      const dbKey = KEY_MAP[key];
      if (!dbKey) continue;

      const dbValue = typeof value === 'boolean' ? String(value) : String(value);

      const existing = await this.db
        .select()
        .from(systemSettings)
        .where(eq(systemSettings.settingKey, dbKey))
        .limit(1);

      if (existing.length > 0) {
        await this.db
          .update(systemSettings)
          .set({ settingValue: dbValue })
          .where(eq(systemSettings.settingKey, dbKey));
      } else {
        await this.db.insert(systemSettings).values({
          settingKey: dbKey,
          settingValue: dbValue,
        });
      }
    }

    return this.getSettings();
  }
}
