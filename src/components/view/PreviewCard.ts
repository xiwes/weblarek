import { Card } from './Card';
import { IEvents } from '../base/Events';
import { IProduct } from '../../types';
import { ensureElement } from '../../utils/utils';
import { categoryMap, CDN_URL } from '../../utils/constants';

type TPreviewAction = 'buy' | 'remove';
type CategoryKey = keyof typeof categoryMap;

interface IPreviewActions {
  onBuy: () => void;
  onRemove: () => void;
}

/**
 * Карточка товара в модалке (просмотр товара).
 */
export class PreviewCard extends Card {
  private imageElement: HTMLImageElement;
  private categoryElement: HTMLElement;
  private descriptionElement: HTMLElement;
  private buttonElement: HTMLButtonElement;
  private action: TPreviewAction = 'buy';
  private actions?: IPreviewActions;

  constructor(container: HTMLElement, events: IEvents, actions?: IPreviewActions) {
    super(container, events);

    this.imageElement = ensureElement<HTMLImageElement>(
      '.card__image',
      this.container
    );
    this.categoryElement = ensureElement<HTMLElement>(
      '.card__category',
      this.container
    );
    this.descriptionElement = ensureElement<HTMLElement>(
      '.card__text',
      this.container
    );
    this.buttonElement = ensureElement<HTMLButtonElement>(
      '.card__button',
      this.container
    );
    this.actions = actions;

    this.buttonElement.addEventListener('click', (event) => {
      event.preventDefault();
      if (this.buttonElement.disabled) return;

      if (this.action === 'remove') {
        this.actions?.onRemove?.();
      } else {
        this.actions?.onBuy?.();
      }
    });
  }

  setProduct(product: IProduct) {
    super.setProduct(product);
    this.setCategory(product.category);

    // картинка через базовый setImage (из View)
    this.setImage(this.imageElement, CDN_URL + product.image, product.title);

    this.descriptionElement.textContent = product.description;
    this.setAvailable(product.price !== null);
  }

  setAction(action: TPreviewAction) {
    this.action = action;
    this.buttonElement.textContent =
      action === 'buy' ? 'Купить' : 'Удалить из корзины';
  }

  setAvailable(available: boolean) {
    if (!available) {
      this.buttonElement.disabled = true;
      this.buttonElement.textContent = 'Недоступно';
    } else {
      this.buttonElement.disabled = false;
      this.setAction(this.action);
    }
  }

  protected setCategory(category: string) {
    this.categoryElement.textContent = category;
    this.categoryElement.className = 'card__category';

    for (const key in categoryMap) {
      const modifier = categoryMap[key as CategoryKey];
      this.categoryElement.classList.toggle(modifier, key === category);
    }
  }

  protected setPrice(price: number | null) {
    super.setPrice(price);
    this.setAvailable(price !== null);
  }
}
