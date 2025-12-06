import { IApi, IProduct, IOrder } from '../types';

/**
 * Класс коммуникационного слоя.
 * Отвечает за получение товаров с сервера и отправку заказов.
 */
export class LarekApi {
  private api: IApi;

  constructor(api: IApi) {
    this.api = api;
  }

  // GET /product/
  async getProducts(): Promise<IProduct[]> {
    const response = await this.api.get<{ items: IProduct[] }>('/product/');
    return response.items;
  }

  // POST /order/
  async sendOrder(order: IOrder): Promise<{ id: string; total: number }> {
    // order у нас вида { items, buyer: { payment, email, phone, address } }
    // а сервер ждёт плоский объект — разворачиваем buyer
    const payload = {
      items: order.items,
      payment: order.buyer.payment,
      email: order.buyer.email,
      phone: order.buyer.phone,
      address: order.buyer.address,
    };

    const response = await this.api.post<{ id: string; total: number }>(
      '/order/',
      payload
    );
    return response;
  }
}
