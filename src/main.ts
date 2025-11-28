import './scss/styles.scss';

import { Products } from './components/Models/Products';
import { Cart } from './components/Models/Cart';
import { Buyer } from './components/Models/Buyer';
import { LarekApi } from './components/LarekApi';
import { Api } from './components/base/Api';
import { API_URL } from './utils/constants';
import { apiProducts } from './utils/data';

// Создаём экземпляры моделей данных
const productsModel = new Products();
const cartModel = new Cart();
const buyerModel = new Buyer();

// ------------------------
// Тестирование модели каталога товаров
// ------------------------

// наполняем каталог локальными данными из apiProducts
productsModel.setItems(apiProducts.items);
console.log('Каталог (локальные данные):', productsModel.getItems());

const firstProduct = productsModel.getItems()[0];
if (firstProduct) {
  console.log('Товар по id:', productsModel.getItemById(firstProduct.id));
  productsModel.setCurrentItem(firstProduct);
  console.log('Текущий выбранный товар:', productsModel.getCurrentItem());
}

// ------------------------
// Тестирование модели корзины
// ------------------------
console.log('Корзина изначально:', cartModel.getItems());

if (firstProduct) {
  cartModel.addItem(firstProduct);
  console.log('Корзина после добавления товара:', cartModel.getItems());
  console.log('Количество товаров в корзине:', cartModel.getCount());
  console.log('Общая стоимость корзины:', cartModel.getTotalPrice());
  console.log('Товар в корзине по id:', cartModel.isInCart(firstProduct.id));

  cartModel.removeItem(firstProduct);
  console.log('Корзина после удаления товара:', cartModel.getItems());

  cartModel.addItem(firstProduct);
}

cartModel.clear();
console.log('Корзина после очистки:', cartModel.getItems());

// ------------------------
// Тестирование модели покупателя
// ------------------------

// имитация первого шага оформления заказа
buyerModel.saveData({ payment: 'card' });
buyerModel.saveData({ email: 'test@example.com' });
buyerModel.saveData({ phone: '1234567890' });
console.log('Данные покупателя (частично):', buyerModel.getData());
console.log('Ошибки валидации (после частичного заполнения):', buyerModel.validate());

// имитация второго шага оформления заказа
buyerModel.saveData({ address: 'Город, улица, дом' });
console.log('Данные покупателя (полностью):', buyerModel.getData());
console.log('Ошибки валидации (после полного заполнения):', buyerModel.validate());

// ------------------------
// Работа с сервером через LarekApi
// ------------------------

const baseApi = new Api(API_URL);
const larekApi = new LarekApi(baseApi);

larekApi
  .getProducts()
  .then((items) => {
    productsModel.setItems(items);
    console.log('Каталог товаров, загруженный с сервера:', productsModel.getItems());
  })
  .catch((error) => {
    console.error('Ошибка при загрузке товаров с сервера:', error);
  });
