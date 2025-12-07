import { Card } from './Card';
import { IEvents } from '../base/Events';
import { IProduct } from '../../types';
import { ensureElement } from '../../utils/utils';
import { categoryMap, CDN_URL } from '../../utils/constants';

type CategoryKey = keyof typeof categoryMap;

interface ICardActions {
  onClick: () => void;
}

/**
 * Карточка товара в каталоге.
 * Отображает категорию и картинку и вызывает
 * переданный обработчик при клике.
 */
export class CatalogCard extends Card {
  protected imageElement: HTMLImageElement;
  protected categoryElement: HTMLElement;
  private onClick?: () => void;

  constructor(container: HTMLElement, events: IEvents, actions?: ICardActions) {
    super(container, events);

    this.categoryElement = ensureElement<HTMLElement>(
      '.card__category',
      this.container
    );
    this.imageElement = ensureElement<HTMLImageElement>(
      '.card__image',
      this.container
    );

    this.onClick = actions?.onClick;

    if (this.onClick) {
      this.container.addEventListener('click', (event) => {
        event.preventDefault();
        this.onClick?.();
      });
    }
  }

  setProduct(product: IProduct) {
    // название + цена из базового класса
    super.setProduct(product);

    // категория
    this.setCategory(product.category);

    // картинка — используем setImage из View:
    this.setImage(this.imageElement, CDN_URL + product.image, product.title);
  }

  protected setCategory(category: string) {
    this.categoryElement.textContent = category;
    this.categoryElement.className = 'card__category';

    for (const key in categoryMap) {
      const modifier = categoryMap[key as CategoryKey];
      this.categoryElement.classList.toggle(modifier, key === category);
    }
  }
}
