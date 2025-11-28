import { IProduct } from '../../types';

/**
 * Модель данных каталога товаров.
 * Хранит список всех товаров и товар, выбранный для подробного просмотра.
 */
export class Products {
  private items: IProduct[] = [];
  private currentItem: IProduct | null = null;

  /**
   * Сохранить массив товаров в модель.
   */
  setItems(items: IProduct[]): void {
    this.items = items;
  }

  /**
   * Получить весь список товаров из каталога.
   */
  getItems(): IProduct[] {
    return this.items;
  }

  /**
   * Найти товар по его идентификатору.
   */
  getItemById(id: string): IProduct | undefined {
    return this.items.find((product) => product.id === id);
  }

  /**
   * Сохранить товар, выбранный для подробного отображения.
   */
  setCurrentItem(product: IProduct): void {
    this.currentItem = product;
  }

  /**
   * Получить товар, выбранный для подробного отображения.
   */
  getCurrentItem(): IProduct | null {
    return this.currentItem;
  }
}
