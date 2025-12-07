import { Form } from './Form';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';
import { TPayment } from '../../types';

export class OrderForm extends Form {
  private addressInput: HTMLInputElement;
  private cardButton: HTMLButtonElement;
  private cashButton: HTMLButtonElement;

  constructor(form: HTMLFormElement, events: IEvents) {
    super(form, events);

    this.addressInput = ensureElement<HTMLInputElement>(
      'input[name="address"]',
      form
    );
    this.cardButton = ensureElement<HTMLButtonElement>(
      'button[name="card"]',
      form
    );
    this.cashButton = ensureElement<HTMLButtonElement>(
      'button[name="cash"]',
      form
    );

    this.cardButton.addEventListener('click', (event) => {
      event.preventDefault();
      // представление не решает, как себя перерисовывать —
      // только уведомляет презентер
      this.events.emit('order.payment:change', { payment: 'card' as TPayment });
    });

    this.cashButton.addEventListener('click', (event) => {
      event.preventDefault();
      this.events.emit('order.payment:change', { payment: 'cash' as TPayment });
    });
  }

  setPayment(payment?: TPayment) {
    this.cardButton.classList.toggle('button_alt-active', payment === 'card');
    this.cashButton.classList.toggle('button_alt-active', payment === 'cash');
  }

  setAddress(address?: string) {
    this.addressInput.value = address ?? '';
  }

  protected onSubmit(): void {
    this.events.emit('order:submit', {});
  }

  protected onInputChange(field: string, value: string): void {
    if (field === 'address') {
      this.events.emit('order.address:change', { address: value });
    }
  }
}
