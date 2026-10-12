import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import type {
  Order,
  OrderListParams,
  OrderListResponse,
  CreateOrderDto,
  UpdateOrderStatusDto,
  OrderBatchQueryDto,
} from '@shared/api.interface';

@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async findAll(@Query() params: OrderListParams): Promise<OrderListResponse> {
    const page = params.page ? parseInt(String(params.page), 10) : 1;
    const pageSize = params.pageSize ? parseInt(String(params.pageSize), 10) : 20;
    return this.ordersService.findAll({ ...params, page, pageSize });
  }

  @Get(':orderNo')
  async findByOrderNo(@Param('orderNo') orderNo: string): Promise<Order> {
    const order = await this.ordersService.findByOrderNo(orderNo);
    if (!order) {
      throw new NotFoundException('订单不存在');
    }
    return order;
  }

  @Post('batch')
  async batchQuery(@Body() dto: OrderBatchQueryDto): Promise<Order[]> {
    if (!dto.orderNos || !Array.isArray(dto.orderNos)) {
      throw new BadRequestException('参数错误');
    }
    return this.ordersService.batchQuery(dto.orderNos);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateOrderDto): Promise<Order> {
    return this.ordersService.create(dto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<Order> {
    return this.ordersService.updateStatus(id, dto);
  }
}
