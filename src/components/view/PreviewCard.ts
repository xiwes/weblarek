import { Card } from './Card';
import { IEvents } from '../base/events';

type TPreviewAction = 'buy' | 'remove';

export class PreviewCard extends Card {
  private buttonElement: HTMLButtonElement;
  private action: TPreviewAction = 'buy';

  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);

    this.buttonElement = container.querySelector(
      '.card__button'
    ) as HTMLButtonElement;

    this.buttonElement.addEventListener('click', (event) => {
      event.preventDefault();
      if (this.buttonElement.disabled) return;

      if (this.action === 'remove') {
        this.events.emit('card:remove', { id: this.productId });
      } else {
        this.events.emit('card:buy', { id: this.productId });
      }
    });
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

  protected setPrice(price: number | null) {
    super.setPrice(price);
    this.setAvailable(price !== null);
  }
}
