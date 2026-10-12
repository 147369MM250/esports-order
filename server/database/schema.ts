import { sql } from 'drizzle-orm';
import { index, integer, numeric, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

// ============== 商品分类表 ==============
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  label: varchar("label", { length: 255 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("_created_at", { precision: 3, withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
  createdBy: text("_created_by"),
  updatedAt: timestamp("_updated_at", { precision: 3, withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedBy: text("_updated_by"),
}, (table) => [
  uniqueIndex("categories_key_key").on(table.key),
  index("idx_categories_sort_order").on(table.sortOrder),
]);

// ============== 系统设置表 ==============
export const systemSettings = pgTable("system_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  settingKey: varchar("setting_key", { length: 100 }).notNull().unique(),
  settingValue: text("setting_value"),
  createdAt: timestamp("_created_at", { precision: 3, withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
  createdBy: text("_created_by"),
  updatedAt: timestamp("_updated_at", { precision: 3, withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedBy: text("_updated_by"),
}, (table) => [
  uniqueIndex("system_settings_setting_key_key").on(table.settingKey),
]);

// ============== 订单表 ==============
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderNo: varchar("order_no", { length: 50 }).notNull().unique(),
  productId: uuid("product_id").notNull(),
  productName: varchar("product_name", { length: 255 }).notNull(),
  productPrice: numeric("product_price").notNull().default('0'),
  amount: numeric("amount").notNull().default('0'),
  contact: varchar("contact", { length: 255 }).notNull(),
  gameServer: varchar("game_server", { length: 255 }),
  status: varchar("status", { length: 20 }).notNull().default('pending'),
  rejectReason: text("reject_reason"),
  createdAt: timestamp("_created_at", { precision: 3, withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
  createdBy: text("_created_by"),
  updatedAt: timestamp("_updated_at", { precision: 3, withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedBy: text("_updated_by"),
}, (table) => [
  uniqueIndex("orders_order_no_key").on(table.orderNo),
  index("idx_orders_order_no").on(table.orderNo),
  index("idx_orders_status").on(table.status),
  index("idx_orders_created_at").on(table.createdAt),
]);

// ============== 商品表 ==============
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  price: numeric("price").notNull().default('0'),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull().default('default'),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  status: varchar("status", { length: 20 }).notNull().default('on'),
  createdAt: timestamp("_created_at", { precision: 3, withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
  createdBy: text("_created_by"),
  updatedAt: timestamp("_updated_at", { precision: 3, withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedBy: text("_updated_by"),
}, (table) => [
  index("idx_products_category").on(table.category),
  index("idx_products_status").on(table.status),
]);

export const categoriesTable = categories;
export const ordersTable = orders;
export const productsTable = products;
export const systemSettingsTable = systemSettings;
