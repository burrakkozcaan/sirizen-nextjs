import type { Order, PaginatedResponse, OrderStatus } from '@/types';
import { mockOrders } from '@/data/mock-data';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const orderService = {
  /**
   * Get all orders for the current user
   */
  async getAll(
    options: {
      page?: number;
      per_page?: number;
      status?: OrderStatus;
    } = {}
  ): Promise<PaginatedResponse<Order>> {
    await delay(200);

    let orders = [...mockOrders];

    if (options.status) {
      orders = orders.filter(o => o.status === options.status);
    }

    // Sort by date descending
    orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const page = options.page || 1;
    const perPage = options.per_page || 10;
    const total = orders.length;
    const start = (page - 1) * perPage;
    const end = start + perPage;

    return {
      data: orders.slice(start, end),
      meta: {
        current_page: page,
        last_page: Math.ceil(total / perPage),
        per_page: perPage,
        total,
      },
    };
  },

  /**
   * Get order by ID
   */
  async getById(id: number): Promise<Order | null> {
    await delay(150);
    return mockOrders.find(o => o.id === id) || null;
  },

  /**
   * Get order by order number
   */
  async getByOrderNumber(orderNumber: string): Promise<Order | null> {
    await delay(150);
    return mockOrders.find(o => o.order_number === orderNumber) || null;
  },

  /**
   * Get order count by status
   */
  async getStatusCounts(): Promise<Record<string, number>> {
    await delay(100);
    
    const counts: Record<string, number> = {
      all: mockOrders.length,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    mockOrders.forEach(order => {
      counts[order.status] = (counts[order.status] || 0) + 1;
    });

    return counts;
  },

  /**
   * Track order (get tracking info)
   */
  async getTracking(orderId: number): Promise<{
    tracking_number: string | null;
    tracking_url: string | null;
    status_history: Array<{
      status: string;
      date: string;
      description: string;
    }>;
  }> {
    await delay(200);

    const order = mockOrders.find(o => o.id === orderId);
    if (!order) {
      return { tracking_number: null, tracking_url: null, status_history: [] };
    }

    return {
      tracking_number: order.items[0]?.tracking_number || null,
      tracking_url: order.items[0]?.tracking_url || null,
      status_history: [
        { status: 'pending', date: order.created_at, description: 'Sipariş alındı' },
        { status: 'confirmed', date: order.created_at, description: 'Sipariş onaylandı' },
        { status: 'preparing', date: order.created_at, description: 'Sipariş hazırlanıyor' },
        { status: 'shipped', date: order.created_at, description: 'Kargoya verildi' },
        { status: 'delivered', date: order.updated_at, description: 'Teslim edildi' },
      ],
    };
  },
};
