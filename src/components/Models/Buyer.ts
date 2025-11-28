import { IBuyer, TPayment } from '../../types';

/**
 * Модель данных покупателя.
 * Хранит контактные данные и способ оплаты, выполняет их валидацию.
 */
export class Buyer {
  private payment: TPayment | null = null;
  private email = '';
  private phone = '';
  private address = '';

  /**
   * Сохранить данные покупателя.
   * Обновляет только те поля, которые переданы в объекте data.
   */
  saveData(data: Partial<IBuyer>): void {
    if (data.payment !== undefined) {
      this.payment = data.payment;
    }
    if (data.email !== undefined) {
      this.email = data.email;
    }
    if (data.phone !== undefined) {
      this.phone = data.phone;
    }
    if (data.address !== undefined) {
      this.address = data.address;
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
   * Очистить все данные покупателя.
   */
  clear(): void {
    this.payment = null;
    this.email = '';
    this.phone = '';
    this.address = '';
  }

  /**
   * Проверить корректность данных.
   * Возвращает объект с ошибками по полям, если они есть.
   * Поля без ошибок в объект не попадают.
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
