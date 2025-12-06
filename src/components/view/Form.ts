import { View } from '../base/View';
import { IEvents } from '../base/events';
import { ensureElement } from '../../utils/utils';

export interface IFormState {
  valid: boolean;
  errors: string[];
}

export class Form extends View<IFormState> {
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

  render(data?: Partial<IFormState>): HTMLElement {
    if (!data) return this.container;

    if (typeof data.valid === 'boolean') {
      this.setValid(data.valid);
    }

    if (data.errors) {
      this.setErrors(data.errors);
    }

    return this.container;
  }

  // Переопределяются в наследниках (OrderForm, ContactsForm)
  // Здесь просто заглушки
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected onSubmit(): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected onInputChange(field: string, value: string): void {}
}
