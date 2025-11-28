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
  async sendOrder(order: IOrder): Promise<unknown> {
    const response = await this.api.post('/order/', order);
    return response;
  }
}
