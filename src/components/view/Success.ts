import { View } from '../base/View';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

interface ISuccessData {
  total: number;
}

export class Success extends View<ISuccessData> {
  private descriptionElement: HTMLElement;
  private closeButton: HTMLButtonElement;

  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);

    this.descriptionElement = ensureElement<HTMLElement>(
      '.order-success__description',
      container
    );
    this.closeButton = ensureElement<HTMLButtonElement>(
      '.order-success__close',
      container
    );

    this.closeButton.addEventListener('click', () => {
      this.events.emit('success:close', {});
    });
  }

  setTotal(total: number) {
    this.descriptionElement.textContent = `Списано ${total} синапсов`;
  }

  render(data?: Partial<ISuccessData>): HTMLElement {
    if (typeof data?.total === 'number') {
      this.setTotal(data.total);
    }
    return this.container;
  }
}
