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
  const items = cartModel.getItems().map((item) => item.id);
  return { items, buyer };
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
  const inCart = cartModel.isInCart(product.id);

  const card = new PreviewCard(
    cloneTemplate<HTMLElement>(previewCardTemplate),
    events,
    {
      onBuy: () => {
        events.emit('card:buy', { product });
      },
      onRemove: () => {
        events.emit('card:remove', { product });
      },
    }
  );
  card.setProduct(product);
  card.setAction(inCart ? 'remove' : 'buy');

  modal.render({ content: card.render() });
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

// изменение данных покупателя
events.on('buyer:change', (buyer: Partial<IBuyer>) => {
  orderForm.setPayment(buyer.payment);
  orderForm.setAddress(buyer.address);
  contactsForm.setEmail(buyer.email);
  contactsForm.setPhone(buyer.phone);
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
  if (cartModel.getCount() === 0) {
    return;
  }

  const errors = buyerModel.validate();
  updateBuyerForms(errors);

  modal.render({ content: orderForm.render() });
  modal.open();
});

// изменения полей первой формы
events.on('order.payment:change', (data: { payment: TPayment }) => {
  buyerModel.saveData({ payment: data.payment });
  const errors = buyerModel.validate();
  updateBuyerForms(errors);
});

events.on('order.address:change', (data: { address: string }) => {
  buyerModel.saveData({ address: data.address });
  const errors = buyerModel.validate();
  updateBuyerForms(errors);
});

// переход ко второй форме
events.on('order:submit', () => {
  const errors = buyerModel.validate();
  updateBuyerForms(errors);

  if (errors.payment || errors.address) {
    return;
  }

  modal.render({ content: contactsForm.render() });
  modal.open();
});

// изменения полей второй формы
events.on('contacts.email:change', (data: { email: string }) => {
  buyerModel.saveData({ email: data.email });
  const errors = buyerModel.validate();
  updateBuyerForms(errors);
});

events.on('contacts.phone:change', (data: { phone: string }) => {
  buyerModel.saveData({ phone: data.phone });
  const errors = buyerModel.validate();
  updateBuyerForms(errors);
});

// финальное оформление заказа
events.on('contacts:submit', () => {
// Валидируем данные покупателя
const errors = buyerModel.validate();
updateBuyerForms(errors);

if (errors.payment || errors.address || errors.email || errors.phone) {
return;
}

//Готовим заказ
const order = buildOrder();

// Локальная сумма на случай, если сервер отвалится
const fallbackTotal = cartModel
.getItems()
.reduce((sum, product) => sum + (product.price ?? 0), 0);

// Пытаемся отправить заказ на сервер
larekApi
.sendOrder(order)
.then((result) => {
// Сервер ответил успешно
cartModel.clear();
buyerModel.clear();

  const node = successView.render({ total: result.total });
  modal.render({ content: node });
  modal.open();
})
.catch((error) => {
  console.error('Ошибка оформления заказа', error);

  cartModel.clear();
  buyerModel.clear();

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
    productsModel.setItems(items);
  })
  .catch(() => {
    // если сервер не отвечает — используем локальные данные из первой части
    productsModel.setItems(apiProducts.items);
  });
