import { Products } from './Products';
import { Cart } from './Cart';
import { Buyer } from './Buyer';
import { IBuyer, IBuyerErrors, IOrder, IProduct } from '../../types';
import { IEvents } from '../base/events';

export class AppState {
  private products: Products;
  private cart: Cart;
  private buyer: Buyer;
  private events: IEvents;

  constructor(
    products: Products,
    cart: Cart,
    buyer: Buyer,
    events: IEvents
  ) {
    this.products = products;
    this.cart = cart;
    this.buyer = buyer;
    this.events = events;
  }

  // ---------- КАТАЛОГ ----------

  setCatalog(items: IProduct[]): void {
    this.products.setItems(items);
    this.events.emit('catalog:change', this.products.getItems());
  }

  selectProduct(id: string): void {
    const product = this.products.getItemById(id);
    if (!product) return;
    this.products.setCurrentItem(product);
    this.events.emit('preview:change', product);
  }

  // ---------- КОРЗИНА ----------

  private emitCartChange(): void {
    this.events.emit('cart:change', {
      items: this.cart.getItems(),
      total: this.cart.getTotalPrice(),
    });
  }

  addToCart(id: string): void {
    const product = this.products.getItemById(id);
    if (!product) return;
    this.cart.addItem(product);
    this.emitCartChange();
  }

  removeFromCart(id: string): void {
    const product = this.products.getItemById(id);
    if (!product) return;
    this.cart.removeItem(product);
    this.emitCartChange();
  }

  isInCart(id: string): boolean {
    return this.cart.isInCart(id);
  }

  getCartCount(): number {
    return this.cart.getCount();
  }

  // сумма товаров в корзине — пригодится как фоллбек,
  // если сервер при оформлении заказа не ответит
  getCartTotal(): number {
    return this.cart.getTotalPrice();
  }

  // ---------- ПОКУПАТЕЛЬ ----------

  updateBuyer(data: Partial<IBuyer>): void {
    // Сохраняем новые данные
    this.buyer.saveData(data);

    // Сообщаем формам, что данные покупателя изменились
    this.events.emit('buyer:change', this.buyer.getData());

    // И сразу пересчитываем ошибки
    this.validateBuyer();
  }

  validateBuyer(): IBuyerErrors {
    const errors = this.buyer.validate();
    this.events.emit('buyerErrors:change', errors);
    return errors;
  }

  // ---------- ЗАКАЗ ----------

  getOrder(): IOrder {
    const items = this.cart.getItems().map((item) => item.id);
    const buyerData = this.buyer.getData() as IBuyer;
    return {
      items,
      buyer: buyerData,
    };
  }

  completeOrder(): void {
    // очищаем корзину и данные покупателя
    this.cart.clear();
    this.buyer.clear();

    // обновляем корзину на странице
    this.emitCartChange();

    // формы тоже должны очиститься
    this.events.emit('buyer:change', this.buyer.getData());
    this.events.emit('buyerErrors:change', {});
  }
}
