import { View } from '../base/View';
import { IEvents } from '../base/events';
import { IProduct } from '../../types';
import { categoryMap, CDN_URL } from '../../utils/constants';

export class Card extends View<IProduct> {
  protected titleElement: HTMLElement | null;
  protected categoryElement: HTMLElement | null;
  protected imageElement: HTMLImageElement | null;
  protected priceElement: HTMLElement | null;
  protected productId: string | null = null;

  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);

    this.titleElement = container.querySelector('.card__title');
    this.categoryElement = container.querySelector('.card__category');
    this.imageElement = container.querySelector('.card__image');
    this.priceElement = container.querySelector('.card__price');
  }

  // общий метод для всех карточек
  setProduct(product: IProduct) {
    this.productId = product.id;
    this.setTitle(product.title);
    this.setCategory(product.category);
    this.setImage(product.image, product.title);
    this.setPrice(product.price);
  }

  protected setTitle(title: string) {
    if (this.titleElement) {
      this.titleElement.textContent = title;
    }
  }

  protected setCategory(category: string) {
    if (!this.categoryElement) return;

    this.categoryElement.textContent = category;

    // сбрасываем все классы и ставим базовый + модификатор
    this.categoryElement.className = 'card__category';

    const modifier = categoryMap[category as keyof typeof categoryMap];
    if (modifier) {
      this.categoryElement.classList.add(modifier);
    }
  }

  protected setImage(image: string, alt: string) {
    if (!this.imageElement) return;

    // API отдаёт имя с ведущим слэшем, типа "/5_Dots.svg"
    // поэтому просто склеиваем с CDN_URL
    this.imageElement.src = CDN_URL + image;
    this.imageElement.alt = alt;
  }

  protected setPrice(price: number | null) {
    if (!this.priceElement) return;

    if (price === null) {
      this.priceElement.textContent = 'Бесценно';
    } else {
      this.priceElement.textContent = `${price} синапсов`;
    }
  }
}
