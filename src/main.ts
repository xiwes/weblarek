import './scss/styles.scss';

import { Products } from './components/Models/Products';
import { Cart } from './components/Models/Cart';
import { Buyer } from './components/Models/Buyer';
import { LarekApi } from './components/LarekApi';
import { Api } from './components/base/Api';
import { EventEmitter } from './components/base/Events';

import { API_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';

import { Page } from './components/view/Page';
import { Modal } from './components/view/Modal';
import { CatalogCard } from './components/view/CatalogCard';
import { PreviewCard } from './components/view/PreviewCard';
import { BasketCard } from './components/view/BasketCard';
import { Basket } from './components/view/Basket';
import { OrderForm } from './components/view/OrderForm';
import { ContactsForm } from './components/view/ContactsForm';
import { Success } from './components/view/Success';

import {
  IBuyer,
  IBuyerErrors,
  IOrder,
  IProduct,
  TPayment,
} from './types';
import { apiProducts } from './utils/data';

// -------- брокер событий --------

const events = new EventEmitter();

// -------- модели данных --------

const productsModel = new Products(events);
const cartModel = new Cart(events);
const buyerModel = new Buyer(events);

// -------- API --------

const baseApi = new Api(API_URL);
const larekApi = new LarekApi(baseApi);

// -------- view-компоненты --------

// берем именно page__wrapper, чтобы Page отвечал только за свою область разметки
const page = new Page(
  ensureElement<HTMLElement>('.page__wrapper'),
  events
);
const modal = new Modal(
  ensureElement<HTMLElement>('#modal-container'),
  events
);

// шаблоны
const catalogCardTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const previewCardTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketCardTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// статичные компоненты
const basketView = new Basket(cloneTemplate<HTMLElement>(basketTemplate), events);
const orderForm = new OrderForm(
  cloneTemplate<HTMLFormElement>(orderTemplate),
  events
);
const contactsForm = new ContactsForm(
  cloneTemplate<HTMLFormElement>(contactsTemplate),
  events
);
const successView = new Success(
  cloneTemplate<HTMLElement>(successTemplate),
  events
);

// текущий выбранный в превью товар
let currentPreviewProduct: IProduct | null = null;

// один экземпляр карточки превью
const previewCardView = new PreviewCard(
  cloneTemplate<HTMLElement>(previewCardTemplate),
  events,
  {
    onBuy: () => {
      if (currentPreviewProduct) {
        events.emit('card:buy', { product: currentPreviewProduct });
      }
    },
    onRemove: () => {
      if (currentPreviewProduct) {
        events.emit('card:remove', { product: currentPreviewProduct });
      }
    },
  }
);

// -------- вспомогательные функции --------

const updateBuyerForms = (errors: IBuyerErrors) => {
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
};

const buildOrder = (): IOrder => {
  const buyer = buyerModel.getData() as IBuyer;
  const cartItems = cartModel.getItems();
  const items = cartItems.map((item) => item.id);
  const total = cartItems.reduce(
    (sum, product) => sum + (product.price ?? 0),
    0
  );

  return { items, buyer, total };
};

// -------- события моделей (M -> P) --------

// изменение каталога товаров
events.on('catalog:change', (items: IProduct[]) => {
  const cards = items.map((item) => {
    const card = new CatalogCard(
      cloneTemplate<HTMLElement>(catalogCardTemplate),
      events,
      {
        onClick: () => {
          events.emit('card:select', { product: item });
        },
      }
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
  currentPreviewProduct = product;

  const inCart = cartModel.isInCart(product.id);

  previewCardView.setProduct(product);
  previewCardView.setAction(inCart ? 'remove' : 'buy');

  modal.render({ content: previewCardView.render() });
  modal.open();
});

// изменение содержимого корзины
events.on(
  'cart:change',
  (state: { items: IProduct[]; total: number }) => {
    page.render({
      counter: state.items.length,
    });

    const itemNodes = state.items.map((item, index) => {
      const card = new BasketCard(
        cloneTemplate<HTMLElement>(basketCardTemplate),
        events,
        {
          onDelete: () => {
            events.emit('basket:remove', { product: item });
          },
        }
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

// изменение данных покупателя (значения полей)
events.on('buyer:change', (buyer: Partial<IBuyer>) => {
  orderForm.setPayment(buyer.payment);
  orderForm.setAddress(buyer.address);
  contactsForm.setEmail(buyer.email);
  contactsForm.setPhone(buyer.phone);
});

// изменение ошибок покупателя
events.on('buyerErrors:change', (errors: IBuyerErrors) => {
  updateBuyerForms(errors);
});

// -------- события представлений (V -> P) --------

// выбор карточки каталога
events.on('card:select', (data: { product: IProduct }) => {
  productsModel.setCurrentItem(data.product);
});

// покупка товара из превью
events.on('card:buy', (data: { product: IProduct }) => {
  cartModel.addItem(data.product);
  modal.close();
});

// удаление товара из корзины из превью
events.on('card:remove', (data: { product: IProduct }) => {
  cartModel.removeItem(data.product);
  modal.close();
});

// открытие корзины
events.on('basket:open', () => {
  modal.render({ content: basketView.render() });
  modal.open();
});

// удаление товара из корзины (кнопка в списке)
events.on('basket:remove', (data: { product: IProduct }) => {
  cartModel.removeItem(data.product);
});

// нажатие "Оформить" в корзине
events.on('basket:checkout', () => {
  // при первом открытии формы очищаем ошибки и блокируем сабмиты
  orderForm.render({
    valid: false,
    errors: [],
  });

  contactsForm.render({
    valid: false,
    errors: [],
  });

  modal.render({ content: orderForm.render() });
  modal.open();
});

// изменения полей первой формы
events.on('order.payment:change', (data: { payment: TPayment }) => {
  buyerModel.saveData({ payment: data.payment });
});

events.on('order.address:change', (data: { address: string }) => {
  buyerModel.saveData({ address: data.address });
});

// переход ко второй форме
events.on('order:submit', () => {
  // кнопка "Далее" активна только при валидных payment и address
  modal.render({ content: contactsForm.render() });
  modal.open();
});

// изменения полей второй формы
events.on('contacts.email:change', (data: { email: string }) => {
  buyerModel.saveData({ email: data.email });
});

events.on('contacts.phone:change', (data: { phone: string }) => {
  buyerModel.saveData({ phone: data.phone });
});

// финальное оформление заказа
events.on('contacts:submit', () => {
  // в этот момент кнопка активна только при валидных данных
  const order = buildOrder();

  larekApi
    .sendOrder(order)
    .then((result) => {
      cartModel.clear();
      buyerModel.clear();

      const node = successView.render({ total: result.total });
      modal.render({ content: node });
      modal.open();
    })
    .catch((error) => {
      console.error('Ошибка оформления заказа', error);
      // при ошибке заказа данные не очищаем и окно успеха не показываем
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
    productsModel.setItems(items);
  })
  .catch(() => {
    // если сервер не отвечает — используем локальные данные из первой части
    productsModel.setItems(apiProducts.items);
  });
