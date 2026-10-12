import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { eq, and, asc, desc } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE_DATABASE } from '../../database/database.module';
import { products, categories } from '../../database/schema';
import type {
  Product,
  ProductListParams,
  CreateProductDto,
  UpdateProductDto,
  CategoryItem,
} from '@shared/api.interface';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  async findAll(params: ProductListParams): Promise<Product[]> {
    const conditions = [];
    if (params.category) {
      conditions.push(eq(products.category, params.category));
    }
    if (params.status) {
      conditions.push(eq(products.status, params.status));
    }

    const query = conditions.length > 0
      ? this.db.select().from(products).where(and(...conditions)).orderBy(asc(products.sortOrder), desc(products.createdAt))
      : this.db.select().from(products).orderBy(asc(products.sortOrder), desc(products.createdAt));

    const rows = await query;
    return rows.map(row => this.mapToDto(row));
  }

  async getCategories(): Promise<CategoryItem[]> {
    const rows = await this.db
      .select({ key: categories.key, label: categories.label })
      .from(categories)
      .orderBy(asc(categories.sortOrder));

    if (rows.length > 0) {
      return rows.map((row: { key: string; label: string }) => ({
        key: row.key,
        label: row.label,
      }));
    }

    const legacyRows = await this.db
      .select({ category: products.category })
      .from(products)
      .groupBy(products.category)
      .orderBy(asc(products.category));

    const categoryMap: Record<string, string> = {
      rank: '排位代练',
      casual: '娱乐陪玩',
      coaching: '技术教学',
      default: '其他',
    };

    return legacyRows.map((row: { category: string }) => ({
      key: row.category,
      label: categoryMap[row.category] || row.category,
    }));
  }

  async findOne(id: string): Promise<Product> {
    const rows = await this.db.select().from(products).where(eq(products.id, id)).limit(1);
    if (rows.length === 0) {
      throw new NotFoundException('商品不存在');
    }
    return this.mapToDto(rows[0]);
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const rows = await this.db
      .insert(products)
      .values({
        name: dto.name,
        price: String(dto.price),
        description: dto.description || '',
        category: dto.category,
        imageUrl: dto.imageUrl || '',
        sortOrder: dto.sortOrder ?? 0,
        status: dto.status || 'on',
      })
      .returning();
    return this.mapToDto(rows[0]);
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const patch: Record<string, unknown> = {};
    if (dto.name !== undefined) patch.name = dto.name;
    if (dto.price !== undefined) patch.price = String(dto.price);
    if (dto.description !== undefined) patch.description = dto.description;
    if (dto.category !== undefined) patch.category = dto.category;
    if (dto.imageUrl !== undefined) patch.imageUrl = dto.imageUrl;
    if (dto.sortOrder !== undefined) patch.sortOrder = dto.sortOrder;
    if (dto.status !== undefined) patch.status = dto.status;

    if (Object.keys(patch).length === 0) {
      return this.findOne(id);
    }

    const rows = await this.db
      .update(products)
      .set(patch)
      .where(eq(products.id, id))
      .returning();

    if (rows.length === 0) {
      throw new NotFoundException('商品不存在');
    }
    return this.mapToDto(rows[0]);
  }

  async remove(id: string): Promise<void> {
    const result = await this.db.delete(products).where(eq(products.id, id)).returning({ id: products.id });
    if (result.length === 0) {
      throw new NotFoundException('商品不存在');
    }
  }

  private mapToDto(row: typeof products.$inferSelect): Product {
    return {
      id: row.id,
      name: row.name,
      price: String(row.price),
      description: row.description || '',
      category: row.category,
      imageUrl: row.imageUrl || '',
      sortOrder: row.sortOrder,
      status: row.status as 'on' | 'off',
      createdAt: row.createdAt.toISOString(),
    };
  }
}
