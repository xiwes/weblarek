import { IBuyer, IBuyerErrors } from '../../types';
import { IEvents } from '../base/Events';

/**
 * Модель данных покупателя.
 * Хранит введённые данные и выполняет их валидацию.
 */
export class Buyer {
  private data: Partial<IBuyer> = {};
  private events: IEvents;

  constructor(events: IEvents) {
    this.events = events;
  }

  getData(): Partial<IBuyer> {
    return this.data;
  }

  saveData(partial: Partial<IBuyer>) {
    this.data = { ...this.data, ...partial };
    this.emitChanges();
  }

  clear() {
    this.data = {};
    // сообщаем, что данные сброшены
    this.events.emit('buyer:change', this.data);
  }

  validate(): IBuyerErrors {
    const errors: IBuyerErrors = {};

    if (!this.data.payment) {
      errors.payment = 'Не выбран способ оплаты';
    }
    if (!this.data.address || !this.data.address.trim()) {
      errors.address = 'Не указан адрес';
    }
    if (!this.data.email || !this.data.email.trim()) {
      errors.email = 'Не указан email';
    }
    if (!this.data.phone || !this.data.phone.trim()) {
      errors.phone = 'Не указан телефон';
    }

    return errors;
  }

  private emitChanges() {
    const errors = this.validate();
    this.events.emit('buyer:change', this.data);
    this.events.emit('buyerErrors:change', errors);
  }
}
