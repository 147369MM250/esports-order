import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { eq, asc, desc, count } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE_DATABASE } from '../../database/database.module';
import { categories, products } from '../../database/schema';
import type {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  DeleteCategoryResponse,
} from '@shared/api.interface';

function extractPostgresErrorCode(error: unknown): string | undefined {
  let current: unknown = error;
  for (let depth = 0; depth < 4 && current && typeof current === 'object'; depth += 1) {
    const { code, cause } = current as { code?: unknown; cause?: unknown };
    if (typeof code === 'string') return code;
    current = cause;
  }
  return undefined;
}

@Injectable()
export class CategoriesService {
  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  async findAll(): Promise<Category[]> {
    const rows = await this.db
      .select()
      .from(categories)
      .orderBy(asc(categories.sortOrder), desc(categories.createdAt));
    return rows.map((row: typeof categories.$inferSelect) => this.mapToDto(row));
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    try {
      const rows = await this.db
        .insert(categories)
        .values({
          key: dto.key,
          label: dto.label,
          sortOrder: dto.sortOrder ?? 0,
        })
        .returning();
      return this.mapToDto(rows[0]);
    } catch (error: unknown) {
      const code = extractPostgresErrorCode(error);
      if (code === '23505') {
        throw new ConflictException('分类 key 已存在');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const patch: Partial<typeof categories.$inferInsert> = {};
    if (dto.key !== undefined) patch.key = dto.key;
    if (dto.label !== undefined) patch.label = dto.label;
    if (dto.sortOrder !== undefined) patch.sortOrder = dto.sortOrder;

    if (Object.keys(patch).length === 0) {
      const rows = await this.db
        .select()
        .from(categories)
        .where(eq(categories.id, id))
        .limit(1);
      if (rows.length === 0) {
        throw new NotFoundException('分类不存在');
      }
      return this.mapToDto(rows[0]);
    }

    try {
      const rows = await this.db
        .update(categories)
        .set(patch)
        .where(eq(categories.id, id))
        .returning();

      if (rows.length === 0) {
        throw new NotFoundException('分类不存在');
      }
      return this.mapToDto(rows[0]);
    } catch (error: unknown) {
      const code = extractPostgresErrorCode(error);
      if (code === '23505') {
        throw new ConflictException('分类 key 已存在');
      }
      throw error;
    }
  }

  async remove(id: string, force: boolean): Promise<DeleteCategoryResponse> {
    const catRows = await this.db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);
    if (catRows.length === 0) {
      throw new NotFoundException('分类不存在');
    }
    const category = catRows[0];

    if (!force) {
      const countRows = await this.db
        .select({ count: count() })
        .from(products)
        .where(eq(products.category, category.key));
      const productCount: number = Number(countRows[0].count);

      if (productCount > 0) {
        return {
          success: false,
          productCount,
          needConfirm: true,
        };
      }
    }

    const deleted = await this.db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning({ id: categories.id });
    if (deleted.length === 0) {
      throw new NotFoundException('分类不存在');
    }

    return { success: true };
  }

  private mapToDto(row: typeof categories.$inferSelect): Category {
    return {
      id: row.id,
      key: row.key,
      label: row.label,
      sortOrder: row.sortOrder,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
