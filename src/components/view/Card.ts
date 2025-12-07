import { View } from '../base/View';
import { IEvents } from '../base/Events';
import { IProduct } from '../../types';
import { ensureElement } from '../../utils/utils';

/**
 * Базовый класс карточки.
 * Содержит только общий для всех карточек функционал:
 * заголовок и цену.
 */
export class Card extends View<IProduct> {
  protected titleElement: HTMLElement;
  protected priceElement: HTMLElement;

  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);

    this.titleElement = ensureElement<HTMLElement>('.card__title', container);
    this.priceElement = ensureElement<HTMLElement>('.card__price', container);
  }

  // общий метод для всех карточек
  setProduct(product: IProduct) {
    this.setTitle(product.title);
    this.setPrice(product.price);
  }

  protected setTitle(title: string) {
    this.titleElement.textContent = title;
  }

  protected setPrice(price: number | null) {
    if (price === null) {
      this.priceElement.textContent = 'Бесценно';
    } else {
      this.priceElement.textContent = `${price} синапсов`;
    }
  }
}
