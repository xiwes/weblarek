import { IProduct } from '../../types';
import { IEvents } from '../base/Events';

/**
 * Модель данных каталога товаров.
 * Хранит список всех товаров и товар, выбранный для подробного просмотра.
 */
export class Products {
  private items: IProduct[] = [];
  private currentItem: IProduct | null = null;
  private events?: IEvents;

  constructor(events?: IEvents) {
    this.events = events;
  }

  /**
   * Сохранить массив товаров в модель.
   * При изменении данных эмитим событие изменения каталога.
   */
  setItems(items: IProduct[]): void {
    this.items = items;
    this.events?.emit('catalog:change', this.items);
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
   * Сохранить товар, выбранный для подробного отображения,
   * и уведомить презентер.
   */
  setCurrentItem(product: IProduct): void {
    this.currentItem = product;
    this.events?.emit('preview:change', product);
  }

  /**
   * Получить товар, выбранный для подробного отображения.
   */
  getCurrentItem(): IProduct | null {
    return this.currentItem;
  }
}
