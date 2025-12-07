import { IBuyer, TPayment } from '../../types';
import { IEvents } from '../base/Events';

/**
 * Модель данных покупателя.
 * Хранит контактные данные и способ оплаты, выполняет их валидацию.
 */
export class Buyer {
  private payment: TPayment | null = null;
  private email = '';
  private phone = '';
  private address = '';
  private events?: IEvents;

  constructor(events?: IEvents) {
    this.events = events;
  }

  /**
   * Сохранить данные покупателя.
   * Обновляет только те поля, которые переданы в объекте data.
   * При изменении данных эмитит buyer:change.
   */
  saveData(data: Partial<IBuyer>): void {
    let changed = false;

    if (data.payment !== undefined && data.payment !== this.payment) {
      this.payment = data.payment;
      changed = true;
    }
    if (data.email !== undefined && data.email !== this.email) {
      this.email = data.email;
      changed = true;
    }
    if (data.phone !== undefined && data.phone !== this.phone) {
      this.phone = data.phone;
      changed = true;
    }
    if (data.address !== undefined && data.address !== this.address) {
      this.address = data.address;
      changed = true;
    }

    if (changed) {
      this.events?.emit('buyer:change', this.getData());
    }
  }

  /**
   * Получить текущие данные покупателя.
   */
  getData(): Partial<IBuyer> {
    return {
      payment: this.payment ?? undefined,
      email: this.email || undefined,
      phone: this.phone || undefined,
      address: this.address || undefined,
    };
  }

  /**
   * Очистить все данные покупателя и уведомить презентер.
   */
  clear(): void {
    this.payment = null;
    this.email = '';
    this.phone = '';
    this.address = '';
    this.events?.emit('buyer:change', this.getData());
  }

  /**
   * Проверить корректность данных.
   * Возвращает объект с ошибками по полям, если они есть.
   */
  validate(): { [key in keyof IBuyer]?: string } {
    const errors: { [key in keyof IBuyer]?: string } = {};

    if (this.payment === null) {
      errors.payment = 'Не выбран вид оплаты';
    }

    if (!this.email) {
      errors.email = 'Укажите email';
    }

    if (!this.phone) {
      errors.phone = 'Укажите телефон';
    }

    if (!this.address) {
      errors.address = 'Укажите адрес';
    }

    return errors;
  }
}
