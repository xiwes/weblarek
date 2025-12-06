import { Form } from './Form';
import { IEvents } from '../base/events';
import { ensureElement } from '../../utils/utils';

export class ContactsForm extends Form {
  private emailInput: HTMLInputElement;
  private phoneInput: HTMLInputElement;

  constructor(container: HTMLFormElement, events: IEvents) {
    super(container, events);

    this.emailInput = ensureElement<HTMLInputElement>(
      'input[name="email"]',
      container
    );
    this.phoneInput = ensureElement<HTMLInputElement>(
      'input[name="phone"]',
      container
    );
  }

  setEmail(email?: string) {
    this.emailInput.value = email ?? '';
  }

  setPhone(phone?: string) {
    this.phoneInput.value = phone ?? '';
  }

  protected onSubmit(): void {
    this.events.emit('contacts:submit', {});
  }

  protected onInputChange(field: string, value: string): void {
    if (field === 'email') {
      this.events.emit('contacts.email:change', { email: value });
    } else if (field === 'phone') {
      this.events.emit('contacts.phone:change', { phone: value });
    }
  }
}
