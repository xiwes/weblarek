import { IProduct } from '../../types';
import { IEvents } from '../base/Events';

/**
 * Модель данных корзины.
 * Хранит товары, которые пользователь выбрал для покупки.
 */
export class Cart {
  private items: IProduct[] = [];
  private events?: IEvents;

  constructor(events?: IEvents) {
    this.events = events;
  }

  private emitChange(): void {
    this.events?.emit('cart:change', {
      items: this.items,
      total: this.getTotalPrice(),
    });
  }

  /**
   * Получить все товары в корзине.
   */
  getItems(): IProduct[] {
    return this.items;
  }

  /**
   * Добавить товар в корзину (если его ещё нет) и уведомить презентер.
   */
  addItem(product: IProduct): void {
    if (!this.items.find((item) => item.id === product.id)) {
      this.items.push(product);
      this.emitChange();
    }
  }

  /**
   * Удалить товар из корзины и уведомить презентер.
   */
  removeItem(product: IProduct): void {
    const initialLength = this.items.length;
    this.items = this.items.filter((item) => item.id !== product.id);

    if (this.items.length !== initialLength) {
      this.emitChange();
    }
  }

  /**
   * Очистить корзину и уведомить презентер.
   */
  clear(): void {
    if (this.items.length) {
      this.items = [];
      this.emitChange();
    }
  }

  /**
   * Получить суммарную стоимость всех товаров в корзине.
   * Товары без цены (price = null) считаются как 0.
   */
  getTotalPrice(): number {
    return this.items.reduce((total, product) => {
      return total + (product.price ?? 0);
    }, 0);
  }

  /**
   * Получить количество товаров в корзине.
   */
  getCount(): number {
    return this.items.length;
  }

  /**
   * Проверить, есть ли в корзине товар с указанным id.
   */
  isInCart(id: string): boolean {
    return this.items.some((item) => item.id === id);
  }
}
