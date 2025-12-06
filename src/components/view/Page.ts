import { View } from '../base/View';
import { IPage } from '../../types';
import { IEvents } from '../base/events';
import { ensureElement } from '../../utils/utils';

export class Page extends View<IPage> {
  private galleryElement: HTMLElement;
  private basketCounterElement: HTMLElement;
  private basketButtonElement: HTMLButtonElement;
  private wrapperElement: HTMLElement;

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
    this.wrapperElement = ensureElement<HTMLElement>('.page__wrapper', container);

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

  setLocked(locked: boolean) {
    if (locked) {
      this.wrapperElement.classList.add('page__wrapper_locked');
    } else {
      this.wrapperElement.classList.remove('page__wrapper_locked');
    }
  }

  render(data?: Partial<IPage>): HTMLElement {
    if (!data) return this.container;
    if (data.catalog) this.setCatalog(data.catalog);
    if (typeof data.counter === 'number') this.setCounter(data.counter);
    if (typeof data.locked === 'boolean') this.setLocked(data.locked);
    return this.container;
  }
}
