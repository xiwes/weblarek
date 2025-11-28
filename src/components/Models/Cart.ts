import { IProduct } from '../../types';

/**
 * Модель данных корзины.
 * Хранит товары, которые пользователь выбрал для покупки.
 */
export class Cart {
  private items: IProduct[] = [];

  /**
   * Получить все товары в корзине.
   */
  getItems(): IProduct[] {
    return this.items;
  }

  /**
   * Добавить товар в корзину (если его ещё нет).
   */
  addItem(product: IProduct): void {
    if (!this.items.find((item) => item.id === product.id)) {
      this.items.push(product);
    }
  }

  /**
   * Удалить товар из корзины.
   */
  removeItem(product: IProduct): void {
    this.items = this.items.filter((item) => item.id !== product.id);
  }

  /**
   * Очистить корзину.
   */
  clear(): void {
    this.items = [];
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
