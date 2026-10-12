import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';

import { GlobalExceptionFilter } from './common/filters/exception.filter';
import { DatabaseModule } from './database/database.module';
import { ViewModule } from './modules/view/view.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { SettingsModule } from './modules/settings/settings.module';
import { UploadModule } from './modules/upload/upload.module';
import { MusicModule } from './modules/music/music.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    CategoriesModule,
    ProductsModule,
    OrdersModule,
    SettingsModule,
    UploadModule,
    MusicModule,
    ViewModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
