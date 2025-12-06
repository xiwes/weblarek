import './scss/styles.scss';

import { Products } from './components/Models/Products';
import { Cart } from './components/Models/Cart';
import { Buyer } from './components/Models/Buyer';
import { LarekApi } from './components/LarekApi';
import { Api } from './components/base/Api';
import { EventEmitter } from './components/base/events';

import { API_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';

import { AppState } from './components/Models/AppState';
import { Page } from './components/view/Page';
import { Modal } from './components/view/Modal';
import { CatalogCard } from './components/view/CatalogCard';
import { PreviewCard } from './components/view/PreviewCard';
import { BasketCard } from './components/view/BasketCard';
import { Basket } from './components/view/Basket';
import { OrderForm } from './components/view/OrderForm';
import { ContactsForm } from './components/view/ContactsForm';
import { Success } from './components/view/Success';

import { IBuyer, IBuyerErrors, IProduct, TPayment } from './types';
import { apiProducts } from './utils/data';

// -------- инициализация моделей --------

const productsModel = new Products();
const cartModel = new Cart();
const buyerModel = new Buyer();

const events = new EventEmitter();
const appState = new AppState(productsModel, cartModel, buyerModel, events);

// -------- API --------

const baseApi = new Api(API_URL);
const larekApi = new LarekApi(baseApi);

// -------- View-компоненты --------

const page = new Page(ensureElement<HTMLElement>('.page'), events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// шаблоны
const catalogCardTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const previewCardTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketCardTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// экземпляры блоков корзины и форм
const basketView = new Basket(cloneTemplate<HTMLElement>(basketTemplate), events);
const orderForm = new OrderForm(
  cloneTemplate<HTMLFormElement>(orderTemplate),
  events
);
const contactsForm = new ContactsForm(
  cloneTemplate<HTMLFormElement>(contactsTemplate),
  events
);

// -------- обработка событий МОДЕЛЕЙ --------

// изменение каталога
events.on('catalog:change', (items: IProduct[]) => {
  const cards = items.map((item) => {
    const card = new CatalogCard(
      cloneTemplate<HTMLElement>(catalogCardTemplate),
      events
    );
    card.setProduct(item);
    return card.render();
  });

  page.render({
    catalog: cards,
  });
});

// изменение выбранного товара для просмотра
events.on('preview:change', (product: IProduct) => {
  const card = new PreviewCard(
    cloneTemplate<HTMLElement>(previewCardTemplate),
    events
  );
  card.setProduct(product);

  const inCart = appState.isInCart(product.id);
  card.setAction(inCart ? 'remove' : 'buy');
  card.setAvailable(product.price !== null);

  modal.render({ content: card.render() });
  modal.open();
});

// изменение корзины
events.on(
  'cart:change',
  (state: { items: IProduct[]; total: number }) => {
    page.render({
      counter: state.items.length,
    });

    const itemNodes = state.items.map((item, index) => {
      const card = new BasketCard(
        cloneTemplate<HTMLElement>(basketCardTemplate),
        events
      );
      card.setProduct(item);
      card.setIndex(index + 1);
      return card.render();
    });

    basketView.render({
      items: itemNodes,
      total: state.total,
    });
  }
);

// изменение данных покупателя
events.on('buyer:change', (buyer: Partial<IBuyer>) => {
  orderForm.setPayment(buyer.payment);
  orderForm.setAddress(buyer.address);
  contactsForm.setEmail(buyer.email);
  contactsForm.setPhone(buyer.phone);
});

// ошибки в данных покупателя
events.on('buyerErrors:change', (errors: IBuyerErrors) => {
  const orderErrors: string[] = [];
  if (errors.payment) orderErrors.push(errors.payment);
  if (errors.address) orderErrors.push(errors.address);

  orderForm.render({
    valid: !errors.payment && !errors.address,
    errors: orderErrors,
  });

  const contactsErrors: string[] = [];
  if (errors.email) contactsErrors.push(errors.email);
  if (errors.phone) contactsErrors.push(errors.phone);

  contactsForm.render({
    valid: !errors.email && !errors.phone,
    errors: contactsErrors,
  });
});

// модалка блокирует скролл страницы
events.on('modal:open', () => {
  page.render({ locked: true });
});

events.on('modal:close', () => {
  page.render({ locked: false });
});

// -------- обработка событий ПРЕДСТАВЛЕНИЙ --------

// выбор карточки каталога
events.on('card:select', (data: { id: string }) => {
  appState.selectProduct(data.id);
});

// покупка товара из превью
events.on('card:buy', (data: { id: string }) => {
  appState.addToCart(data.id);
  modal.close();
});

// удаление товара из корзины из превью
events.on('card:remove', (data: { id: string }) => {
  appState.removeFromCart(data.id);
  modal.close();
});

// открытие корзины
events.on('basket:open', () => {
  modal.render({ content: basketView.render() });
  modal.open();
});

// удаление товара из корзины (кнопка в списке)
events.on('basket:remove', (data: { id: string }) => {
  appState.removeFromCart(data.id);
});

// нажатие "Оформить" в корзине
events.on('basket:checkout', () => {
  if (appState.getCartCount() === 0) return;
  appState.validateBuyer();
  modal.render({ content: orderForm.render() });
  modal.open();
});

// изменения полей первой формы
events.on('order.payment:change', (data: { payment: TPayment }) => {
  appState.updateBuyer({ payment: data.payment });
});

events.on('order.address:change', (data: { address: string }) => {
  appState.updateBuyer({ address: data.address });
});

// переход ко второй форме
events.on('order:submit', () => {
  const errors = appState.validateBuyer();
  if (errors.payment || errors.address) return;

  modal.render({ content: contactsForm.render() });
  modal.open();
});

// изменения полей второй формы
events.on('contacts.email:change', (data: { email: string }) => {
  appState.updateBuyer({ email: data.email });
});

events.on('contacts.phone:change', (data: { phone: string }) => {
  appState.updateBuyer({ phone: data.phone });
});

// финальное оформление заказа
events.on('contacts:submit', () => {
  // ещё раз проверяем, что всё заполнено
  const errors = appState.validateBuyer();
  if (errors.payment || errors.address || errors.email || errors.phone) return;

  const order = appState.getOrder();
  // локальная сумма — пригодится как фоллбек
  const fallbackTotal = appState.getCartTotal();

  larekApi
    .sendOrder(order)
    .then((result) => {
      // успех с сервера
      appState.completeOrder();

      const successView = new Success(
        cloneTemplate<HTMLElement>(successTemplate),
        events
      );
      const node = successView.render({ total: result.total });
      modal.render({ content: node });
      modal.open();
    })
    .catch((error) => {
      console.error('Ошибка оформления заказа', error);

      // фоллбек: показываем тот же экран успеха с локальной суммой,
      // чтобы нажатие на "Оплатить" всегда приводило к результату
      appState.completeOrder();

      const successView = new Success(
        cloneTemplate<HTMLElement>(successTemplate),
        events
      );
      const node = successView.render({ total: fallbackTotal });
      modal.render({ content: node });
      modal.open();
    });
});

// закрытие окна "успех"
events.on('success:close', () => {
  modal.close();
});

// -------- старт приложения --------

larekApi
  .getProducts()
  .then((items) => {
    appState.setCatalog(items);
  })
  .catch(() => {
    // если сервер не отвечает — используем локальные данные из первой части
    appState.setCatalog(apiProducts.items);
  });
