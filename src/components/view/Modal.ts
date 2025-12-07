import { View } from '../base/View';
import { IEvents } from '../base/Events';
import { IModalData } from '../../types';
import { ensureElement } from '../../utils/utils';

export class Modal extends View<IModalData> {
  private contentElement: HTMLElement;
  private closeButtonElement: HTMLButtonElement;

  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);

    // Находим элементы внутри модалки
    this.contentElement = ensureElement<HTMLElement>(
      '.modal__content',
      container
    );
    this.closeButtonElement = ensureElement<HTMLButtonElement>(
      '.modal__close',
      container
    );

    // Обработчик крестика
    this.closeButtonElement.addEventListener('click', () => {
      this.close();
    });

    // Закрытие по клику по фону
    this.container.addEventListener('click', (event) => {
      if (event.target === this.container) {
        this.close();
      }
    });
  }

  // Установить содержимое модалки
  setContent(content: HTMLElement | null) {
    this.contentElement.replaceChildren();
    if (content) {
      this.contentElement.append(content);
    }
  }

  // Открыть модалку
  open() {
    this.container.classList.add('modal_active');
    this.events.emit('modal:open', {});
  }

  // Закрыть модалку
  close() {
    this.container.classList.remove('modal_active');
    this.setContent(null);
    this.events.emit('modal:close', {});
  }

  // render для совместимости с остальными View
  render(data?: Partial<IModalData>): HTMLElement {
    if (data && 'content' in data) {
      this.setContent(data.content ?? null);
    }
    return this.container;
  }
}
