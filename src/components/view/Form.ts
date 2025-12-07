import { View } from '../base/View';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';
import { IFormState } from '../../types';

/**
 * Базовый класс формы.
 * Не хранит бизнес-данные, только управляет разметкой
 * и пробрасывает события наружу через абстрактные методы.
 */
export abstract class Form extends View<IFormState> {
  protected submitButton: HTMLButtonElement;
  protected errorsElement: HTMLElement;

  constructor(container: HTMLFormElement, events: IEvents) {
    super(container, events);

    this.submitButton = ensureElement<HTMLButtonElement>(
      'button[type="submit"]',
      container
    );
    this.errorsElement = ensureElement<HTMLElement>(
      '.form__errors',
      container
    );

    // Сабмит формы
    container.addEventListener('submit', (event) => {
      event.preventDefault();
      this.onSubmit();
    });

    // Любое изменение инпутов
    container.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement | HTMLTextAreaElement;
      if (!target.name) return;
      this.onInputChange(target.name, target.value);
    });
  }

  setValid(valid: boolean) {
    this.submitButton.disabled = !valid;
  }

  setErrors(errors: string[]) {
    this.errorsElement.textContent = errors.join(', ');
  }

  render(data: Partial<IFormState> = {}): HTMLElement {
    if (typeof data.valid === 'boolean') {
      this.setValid(data.valid);
    }

    if (data.errors) {
      this.setErrors(data.errors);
    }

    return this.container;
  }

  protected abstract onSubmit(): void;

  protected abstract onInputChange(field: string, value: string): void;
}
