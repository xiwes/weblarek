import { View } from '../base/View';
import { IBasketView } from '../../types';
import { IEvents } from '../base/events';
import { ensureElement } from '../../utils/utils';

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

  setItems(items: HTMLElement[]) {
    if (!items.length) {
      this.listElement.textContent = 'Корзина пуста';
      this.buttonElement.disabled = true;
    } else {
      this.listElement.replaceChildren(...items);
      this.buttonElement.disabled = false;
    }
  }

  setTotal(total: number) {
    this.totalElement.textContent = `${total} синапсов`;
  }

  render(data?: Partial<IBasketView>): HTMLElement {
    if (!data) return this.container;
    if (data.items) this.setItems(data.items);
    if (typeof data.total === 'number') this.setTotal(data.total);
    return this.container;
  }
}
