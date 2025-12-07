import { Card } from './Card';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

interface IBasketCardActions {
  onDelete: () => void;
}

/**
 * Карточка товара внутри корзины.
 * Умеет показывать порядковый номер и вызывает переданный
 * обработчик при нажатии на кнопку удаления.
 */
export class BasketCard extends Card {
  private indexElement: HTMLElement;
  private deleteButton: HTMLButtonElement;

  constructor(container: HTMLElement, events: IEvents, actions?: IBasketCardActions) {
    super(container, events);

    this.indexElement = ensureElement<HTMLElement>('.basket__item-index', container);
    this.deleteButton = ensureElement<HTMLButtonElement>('.basket__item-delete', container);

    if (actions?.onDelete) {
      this.deleteButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        actions.onDelete();
      });
    }
  }

  setIndex(index: number) {
    this.indexElement.textContent = String(index);
  }
}
