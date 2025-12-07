import { View } from '../base/View';
import { IPage } from '../../types';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

/**
 * Представление основной страницы.
 */
export class Page extends View<IPage> {
  private galleryElement: HTMLElement;
  private basketCounterElement: HTMLElement;
  private basketButtonElement: HTMLButtonElement;

  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);

    this.galleryElement = ensureElement<HTMLElement>('.gallery', container);
    this.basketCounterElement = ensureElement<HTMLElement>(
      '.header__basket-counter',
      container
    );
    this.basketButtonElement = ensureElement<HTMLButtonElement>(
      '.header__basket',
      container
    );

    this.basketButtonElement.addEventListener('click', () => {
      this.events.emit('basket:open', {});
    });
  }

  setCatalog(items: HTMLElement[]) {
    this.galleryElement.replaceChildren(...items);
  }

  setCounter(count: number) {
    this.basketCounterElement.textContent = String(count);
  }

  render(data: Partial<IPage> = {}): HTMLElement {
    if (data.catalog) {
      this.setCatalog(data.catalog);
    }
    if (typeof data.counter === 'number') {
      this.setCounter(data.counter);
    }
    return this.container;
  }
}
