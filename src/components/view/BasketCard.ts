import { Card } from './Card';
import { IEvents } from '../base/events';

export class BasketCard extends Card {
  private indexElement: HTMLElement;
  private deleteButton: HTMLButtonElement;

  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);

    this.indexElement = container.querySelector(
      '.basket__item-index'
    ) as HTMLElement;

    this.deleteButton = container.querySelector(
      '.basket__item-delete'
    ) as HTMLButtonElement;

    this.deleteButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.events.emit('basket:remove', { id: this.productId });
    });
  }

  setIndex(index: number) {
    this.indexElement.textContent = String(index);
  }
}
