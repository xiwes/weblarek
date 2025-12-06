import { Card } from './Card';
import { IEvents } from '../base/events';

export class CatalogCard extends Card {
  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);

    this.container.addEventListener('click', () => {
      this.events.emit('card:select', { id: this.productId });
    });
  }
}
