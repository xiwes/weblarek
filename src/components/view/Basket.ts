import { View } from '../base/View';
import { IBasketView } from '../../types';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

/**
 * Представление корзины.
 */
export class Basket extends View<IBasketView> {
  private listElement: HTMLElement;
  private totalElement: HTMLElement;
  private buttonElement: HTMLButtonElement;

  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);

    this.listElement = ensureElement<HTMLElement>('.basket__list', container);
    this.totalElement = ensureElement<HTMLElement>('.basket__price', container);
    this.buttonElement = ensureElement<HTMLButtonElement>(
      '.basket__button',
      container
    );

    this.buttonElement.addEventListener('click', () => {
      this.events.emit('basket:checkout', {});
    });
  }

  set items(items: HTMLElement[]) {
    if (!items.length) {
      // просто очищаем список, отображением "Корзина пуста"
      // занимается вёрстка/стили
      this.listElement.innerHTML = '';
      this.buttonElement.disabled = true;
    } else {
      this.listElement.replaceChildren(...items);
      this.buttonElement.disabled = false;
    }
  }

  set total(total: number) {
    this.totalElement.textContent = `${total} синапсов`;
  }
}
