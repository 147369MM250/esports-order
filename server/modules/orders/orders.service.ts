import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { eq, desc, count, and, inArray } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE_DATABASE } from '../../database/database.module';
import { orders, products } from '../../database/schema';
import type {
  Order,
  OrderStatus,
  OrderListParams,
  OrderListResponse,
  CreateOrderDto,
  UpdateOrderStatusDto,
} from '@shared/api.interface';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  async findAll(params: OrderListParams & { page: number; pageSize: number }): Promise<OrderListResponse> {
    const { page, pageSize, status } = params;
    const offset = (page - 1) * pageSize;

    const conditions = [];
    if (status) {
      conditions.push(eq(orders.status, status));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(orders)
        .where(whereClause)
        .orderBy(desc(orders.createdAt))
        .limit(pageSize)
        .offset(offset),
      this.db
        .select({ count: count() })
        .from(orders)
        .where(whereClause),
    ]);

    return {
      items: rows.map(row => this.mapToDto(row)),
      total: Number(countResult[0]?.count || 0),
      page,
      pageSize,
    };
  }

  async findByOrderNo(orderNo: string): Promise<Order | null> {
    const rows = await this.db
      .select()
      .from(orders)
      .where(eq(orders.orderNo, orderNo))
      .limit(1);
    return rows.length > 0 ? this.mapToDto(rows[0]) : null;
  }

  async batchQuery(orderNos: string[]): Promise<Order[]> {
    if (orderNos.length === 0) return [];
    const rows = await this.db
      .select()
      .from(orders)
      .where(inArray(orders.orderNo, orderNos))
      .orderBy(desc(orders.createdAt));
    return rows.map(row => this.mapToDto(row));
  }

  async create(dto: CreateOrderDto): Promise<Order> {
    const productRows = await this.db
      .select()
      .from(products)
      .where(eq(products.id, dto.productId))
      .limit(1);

    if (productRows.length === 0) {
      throw new BadRequestException('商品不存在');
    }

    const product = productRows[0];
    const orderNo = this.generateOrderNo();

    const rows = await this.db
      .insert(orders)
      .values({
        orderNo,
        productId: dto.productId,
        productName: product.name,
        productPrice: String(product.price),
        amount: String(product.price),
        contact: dto.contact,
        gameServer: dto.gameServer || '',
        status: 'pending',
      })
      .returning();

    return this.mapToDto(rows[0]);
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<Order> {
    const patch: Record<string, unknown> = {
      status: dto.status,
    };

    if (dto.status === 'reject' && dto.rejectReason) {
      patch.rejectReason = dto.rejectReason;
    }

    const rows = await this.db
      .update(orders)
      .set(patch)
      .where(eq(orders.id, id))
      .returning();

    if (rows.length === 0) {
      throw new NotFoundException('订单不存在');
    }

    return this.mapToDto(rows[0]);
  }

  private generateOrderNo(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(1000 + Math.random() * 9000).toString();
    return `DJ${timestamp}${random}`;
  }

  private mapToDto(row: typeof orders.$inferSelect): Order {
    return {
      id: row.id,
      orderNo: row.orderNo,
      productId: row.productId,
      productName: row.productName,
      productPrice: String(row.productPrice),
      amount: String(row.amount),
      contact: row.contact,
      gameServer: row.gameServer || '',
      status: row.status as OrderStatus,
      rejectReason: row.rejectReason || '',
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
