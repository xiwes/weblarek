# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Vite

Структура проекта:

* src/ — исходные файлы проекта
* src/components/ — папка с компонентами приложения
* src/components/base/ — папка с базовым кодом (общие абстракции)
* src/utils/ — утилиты и константы
* src/types/index.ts — типы данных

Важные файлы:

* index.html — HTML-файл главной страницы
* src/main.ts — точка входа приложения (презентер)
* src/scss/styles.scss — корневой файл стилей
* src/utils/constants.ts — файл с константами
* src/utils/utils.ts — файл с утилитами

## Установка и запуск

```
npm install
npm run dev
```

или

```
yarn
yarn dev
```

## Сборка

```
npm run build
```

или

```
yarn build
```

# Интернет-магазин «Web-Larёk»

«Web-Larёk» — это интернет-магазин с товарами для веб-разработчиков. Пользователь может:

* просматривать каталог товаров;
* открывать детальный просмотр товара в модальном окне;
* добавлять товары в корзину и удалять их оттуда;
* оформлять заказ в два шага (выбор способа оплаты и заполнение контактов);
* отправлять заказ на сервер и получать подтверждение.

Сайт использует модальные окна для просмотра товаров, корзины, форм оформления заказа и окна с результатом оплаты.

## Архитектура приложения

Приложение построено по паттерну MVP (Model–View–Presenter):

* Model — слой данных, отвечает только за хранение и изменение данных и генерацию событий об этих изменениях.
* View — слой представления, отвечает за работу с DOM: поиск элементов, отображение данных, реакция на действия пользователя и генерацию событий.
* Presenter — слой, в котором описана логика приложения. Подписывается на события от моделей и представлений, вызывает методы моделей и передаёт данные в представления.

Связь между слоями выполнена через событийную модель с помощью брокера событий `EventEmitter`.
Модели при изменении данных эмитят события (M → P), презентер обрабатывает их и обновляет представления (P → V).
Представления при действиях пользователя эмитят свои события (V → P), презентер реагирует и вызывает методы моделей (P → M).

---

## Базовый код

### Класс Component

Базовый класс для всех компонентов интерфейса.

Конструктор:
`constructor(container: HTMLElement)`

Поля:

- `container: HTMLElement` — корневой DOM-элемент компонента.

Методы:

- `render(data?: Partial<T>): HTMLElement` — базовый метод рендера. Через `Object.assign` применяет переданные данные к полям экземпляра (вызывая соответствующие сеттеры) и возвращает корневой элемент `container`.
- `setImage(element: HTMLImageElement, src: string, alt?: string): void` — утилита для установки `src` и `alt` у картинки.

Компоненты представления по возможности используют этот метод и не переопределяют `render`, если им не нужна дополнительная логика.

### Класс Api

Содержит базовую логику HTTP-запросов.

Конструктор:
`constructor(baseUrl: string, options: RequestInit = {})`

Поля:

- `baseUrl: string` — базовый адрес сервера;
- `options: RequestInit` — базовые опции запросов (заголовки и т.д.).

Методы:

- `get(uri: string): Promise<object>` — GET-запрос на указанный эндпоинт, возвращает распарсенный JSON-ответ.
- `post(uri: string, data: object, method: ApiPostMethods = 'POST'): Promise<object>` — отправка данных в JSON-формате на указанный эндпоинт; по умолчанию метод `POST`, можно переопределить.
- `protected handleResponse(response: Response): Promise<object>` — проверяет статус ответа, при ошибке отклоняет промис, при успехе возвращает данные.

### Класс EventEmitter

Брокер событий, реализующий паттерн «Наблюдатель».

Конструктор: без параметров.

Поля:

- `_events: Map<string | RegExp, Set<Function>>` — коллекция подписок на события.

Методы:

- `on<T extends object>(event: EventName, callback: (data: T) => void): void` — подписка на событие.
- `emit<T extends object>(event: string, data?: T): void` — генерация события с именем `event` и данными `data`.
- `trigger<T extends object>(event: string, context?: Partial<T>): (data: T) => void` — вспомогательный метод, возвращает функцию, которая при вызове эмитит событие.

---

## Данные

### Интерфейс товара IProduct

```ts
export interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
}
```

Товар описывает одну карточку каталога: идентификатор, описание, путь до изображения, название, категорию и цену.
Если `price = null`, товар недоступен к покупке.

### Тип способа оплаты и интерфейс покупателя IBuyer

```ts
export type TPayment = 'card' | 'cash';

export interface IBuyer {
  payment: TPayment;
  email: string;
  phone: string;
  address: string;
}
```

Покупатель хранит данные, нужные для оформления заказа: способ оплаты, адрес доставки и контакты.

### Объект заказа IOrder

```ts
export interface IOrder {
  items: string[];
  buyer: IBuyer;
  total: number;
}
```

Объект заказа, отправляемый на сервер:

- `items` — массив id выбранных товаров;
- `buyer` — данные покупателя;
- `total` — общая сумма заказа в «синапсах».

---

## Модели данных

Все модели принимают в конструктор экземпляр `EventEmitter` и генерируют события при изменении данных.

### Класс Products

Модель каталога товаров.

Зона ответственности: хранит список всех товаров и текущий выбранный товар.

Конструктор:
`constructor(events: IEvents)`

Поля:

- `items: IProduct[]` — все товары каталога;
- `currentItem: IProduct | null` — товар, выбранный для просмотра.

Основные методы:

- `setItems(items: IProduct[]): void` — сохраняет массив товаров и эмитит событие `catalog:change`.
- `getItems(): IProduct[]` — возвращает массив товаров.
- `getItemById(id: string): IProduct | undefined` — поиск товара по id.
- `setCurrentItem(product: IProduct): void` — сохраняет выбранный товар и эмитит `preview:change`.
- `getCurrentItem(): IProduct | null` — возвращает выбранный товар.

События модели:

- `catalog:change` — каталог товаров обновился;
- `preview:change` — изменён выбранный для просмотра товар.

### Класс Cart

Модель корзины.

Зона ответственности: хранит выбранные товары и считает агрегаты (количество и сумма).

Конструктор:
`constructor(events: IEvents)`

Поля:

- `items: IProduct[]` — товары в корзине.

Основные методы:

- `getItems(): IProduct[]` — товары корзины;
- `addItem(product: IProduct): void` — добавляет товар, если его ещё нет, и эмитит `cart:change`;
- `removeItem(product: IProduct): void` — удаляет товар и эмитит `cart:change`;
- `clear(): void` — очищает корзину и эмитит `cart:change`;
- `getTotalPrice(): number` — суммарная стоимость (товары с `price = null` учитываются как 0);
- `getCount(): number` — число товаров;
- `isInCart(id: string): boolean` — проверка, есть ли товар в корзине.

Событие модели:

- `cart:change` — содержимое корзины изменилось; в событии передаётся массив товаров и итоговая сумма.

### Класс Buyer

Модель данных покупателя и валидации.

Конструктор:
`constructor(events: IEvents)`

Поля (внутреннее состояние модели, может отличаться от интерфейса IBuyer):

- `payment: TPayment | null`;
- `email: string`;
- `phone: string`;
- `address: string`.

Основные методы:

- `saveData(data: Partial<IBuyer>): void` — частичное обновление данных покупателя, после сохранения эмитит `buyer:change` и `buyerErrors:change`.
- `getData(): Partial<IBuyer>` — текущее состояние данных.
- `clear(): void` — очищает данные и тоже эмитит `buyer:change`/`buyerErrors:change`.
- `validate(): IBuyerErrors` — выполняет проверку всех полей и возвращает объект ошибок по полям.

События модели:

- `buyer:change` — данные покупателя обновились;
- `buyerErrors:change` — пересчитаны ошибки валидации (для обновления форм и их валидности).

---

## Слой коммуникации

### Интерфейс IApi

Интерфейс для клиента API, реализуемого базовым классом `Api`. Содержит методы `get` и `post`.

### Класс LarekApi

Класс связи приложения с сервером. Использует `Api` через композицию.

Конструктор:
`constructor(api: IApi)`

Поля:

- `api: IApi` — клиент HTTP-запросов.

Методы:

- `getProducts(): Promise<IProduct[]>` — `GET /product/`, возвращает список товаров.
- `sendOrder(order: IOrder): Promise<{ id: string; total: number }>` — `POST /order/`.
  В тело запроса отправляются:

  - `items` — массив id товаров,
  - `total` — сумма заказа,
  - `payment`, `email`, `phone`, `address` — данные из `buyer`.

При успешном ответе возвращает объект с id заказа и итоговой суммой.

---

## Слой представления (View)

### Базовый класс View

Файл: `src/components/base/View.ts`

Наследуется от `Component`.

Зона ответственности: общий базовый функционал для всех представлений + доступ к брокеру событий.

Конструктор:
`constructor(container: HTMLElement, events: IEvents)`

Поля:

- `container: HTMLElement` — корневой DOM-элемент (наследуется из `Component`);
- `events: IEvents` — брокер событий.

Методы:

- Использует реализацию `render` из `Component`. Потомки в большинстве случаев не переопределяют `render`, а работают через сеттеры.

---

### Класс Page

Файл: `src/components/view/Page.ts`

Зона ответственности: блок `.page__wrapper` — каталог на главной странице и счётчик корзины в шапке.

Конструктор:
`constructor(container: HTMLElement, events: IEvents)`

Поля:

- `galleryElement: HTMLElement` — контейнер для карточек каталога (`.gallery`);
- `basketCounterElement: HTMLElement` — элемент счётчика корзины (`.header__basket-counter`);
- `basketButtonElement: HTMLButtonElement` — кнопка открытия корзины (`.header__basket`).

Методы:

- `setCatalog(items: HTMLElement[]): void` — заменяет содержимое `.gallery` списком карточек.
- `setCounter(count: number): void` — обновляет текст счётчика.
- `render(data: Partial<IPage> = {}): HTMLElement` — если передан `catalog`, вызывает `setCatalog`, если передан `counter`, вызывает `setCounter`, затем возвращает `container`.

События:

- при клике по `basketButtonElement` генерирует `basket:open`.

---

### Класс Modal

Файл: `src/components/view/Modal.ts`

Зона ответственности: модальное окно, показывающее произвольный контент.

Конструктор:
`constructor(container: HTMLElement, events: IEvents)`

Поля:

- `contentElement: HTMLElement` — контейнер для содержимого (`.modal__content`);
- `closeButtonElement: HTMLButtonElement` — кнопка закрытия.

Методы:

- `setContent(content: HTMLElement | null): void` — вставляет новый контент или очищает модалку.
- `open(): void` — добавляет css-модификатор `modal_active` и эмитит событие `modal:open`.
- `close(): void` — убирает `modal_active`, очищает контент и эмитит `modal:close`.
- `render(data?: Partial<IModalData>): HTMLElement` — при наличии `content` вызывает `setContent` и возвращает `container`.

Поведение:

- модалка закрывается по клику на крестик и по клику по фону вокруг `.modal__content`.

---

### Класс Basket

Файл: `src/components/view/Basket.ts`

Зона ответственности: содержимое корзины и сумма заказа — представление шаблона `#basket`.

Конструктор:
`constructor(container: HTMLElement, events: IEvents)`

Поля:

- `listElement: HTMLElement` — список позиций (`.basket__list`);
- `totalElement: HTMLElement` — элемент суммы (`.basket__price`);
- `buttonElement: HTMLButtonElement` — кнопка «Оформить» (`.basket__button`).

Методы:

- сеттер `items(items: HTMLElement[]): void` — заменяет дочерние элементы `listElement`. Если массив пуст, очищает список и отключает кнопку оформления (кнопка недоступна).
- сеттер `total(total: number): void` — устанавливает текст `"N синапсов"`.

Компонент использует базовый `render` из `Component`: достаточно вызвать `basketView.render({ items, total })`.

События:

- при клике по `buttonElement` генерирует `basket:checkout`.

---

### Класс Card

Файл: `src/components/view/Card.ts`

Базовый класс карточек товара.

Конструктор:
`constructor(container: HTMLElement, events: IEvents)`

Поля:

- `titleElement: HTMLElement` — название товара;
- `priceElement: HTMLElement` — цена товара.

Методы:

- `setProduct(product: IProduct): void` — вызывает `setTitle` и `setPrice`.
- `setTitle(title: string): void` — меняет текст заголовка.
- `setPrice(price: number | null): void` — если цена `null`, выводит «Бесценно», иначе — `"N синапсов"`.

---

### Класс CatalogCard

Файл: `src/components/view/CatalogCard.ts`

Зона ответственности: карточка товара в каталоге (шаблон `#card-catalog`).

Конструктор:
`constructor(container: HTMLElement, events: IEvents, actions?: { onClick: () => void })`

Поля:

- `imageElement: HTMLImageElement` — картинка товара (`.card__image`);
- `categoryElement: HTMLElement` — элемент категории (`.card__category`);
- `onClick?: () => void` — обработчик клика по карточке, задаётся презентером.

Методы:

- `setProduct(product: IProduct): void` — устанавливает название и цену через базовый `setProduct`, категорию через `setCategory` и картинку через `setImage` (`CDN_URL + product.image`).
- `setCategory(category: string): void` — задаёт текст категории и CSS-модификатор в соответствии с `categoryMap`.

Поведение:

- при клике по карточке вызывает `onClick`, внутри которого презентер генерирует событие `card:select`.

---

### Класс PreviewCard

Файл: `src/components/view/PreviewCard.ts`

Зона ответственности: карточка товара в модальном окне (просмотр товара, шаблон `#card-preview`).

Конструктор:
`constructor(container: HTMLElement, events: IEvents, actions?: { onBuy: () => void; onRemove: () => void })`

Поля:

- `imageElement: HTMLImageElement` — изображение товара;
- `categoryElement: HTMLElement` — категория (`.card__category`);
- `descriptionElement: HTMLElement` — описание (`.card__text`);
- `buttonElement: HTMLButtonElement` — кнопка действия (`.card__button`).

Методы:

- `setProduct(product: IProduct): void` — через базовый `setProduct` устанавливает название и цену, через `setCategory` — категорию, через `setImage` — картинку, в `descriptionElement` записывает описание и вызывает `setAvailable(product.price !== null)`.
- `setAction(action: 'buy' | 'remove'): void` — обновляет текст кнопки («Купить» или «Удалить из корзины») для доступного товара.
- `setAvailable(available: boolean): void` — если товар недоступен, блокирует кнопку и задаёт текст «Недоступно»; если доступен — включает кнопку и оставляет текст, заданный `setAction`.
- `protected setCategory(category: string): void` — аналогично `CatalogCard` задаёт текст и модификаторы категории.
- `protected setPrice(price: number | null): void` — расширяет базовый метод: после установки текстовой цены вызывает `setAvailable(price !== null)`.

Поведение:

- при клике по кнопке:

  - если кнопка недоступна (`disabled = true`), клик игнорируется;
  - если режим кнопки «Купить», вызывается обработчик `onBuy`;
  - если режим «Удалить из корзины», вызывается `onRemove`.
    Сами обработчики передаются из презентера и внутри генерируют события `card:buy` и `card:remove`.

---

### Класс BasketCard

Файл: `src/components/view/BasketCard.ts`

Зона ответственности: строка товара в корзине (шаблон `#card-basket`).

Конструктор:
`constructor(container: HTMLElement, events: IEvents, actions?: { onDelete: () => void })`

Поля:

- `indexElement: HTMLElement` — порядковый номер;
- `deleteButton: HTMLButtonElement` — кнопка удаления.

Методы:

- `setIndex(index: number): void` — записывает номер позиции в корзине.

Поведение:

- при клике по `deleteButton` вызывает `onDelete` (передан из презентера) и останавливает всплытие события.

---

### Абстрактный класс Form

Файл: `src/components/view/Form.ts`

Базовый класс для всех форм.

Конструктор:
`constructor(container: HTMLFormElement, events: IEvents)`

Поля:

- `submitButton: HTMLButtonElement` — кнопка отправки формы;
- `errorsElement: HTMLElement` — блок с ошибками.

Методы:

- `setValid(valid: boolean): void` — включает или выключает кнопку отправки.
- `setErrors(errors: string[]): void` — выводит ошибки в `errorsElement`.
- `render(data: Partial<IFormState> = {}): HTMLElement` — применяет поля `valid` и `errors` и возвращает `container`.
- `protected abstract onSubmit(): void` — вызывается при отправке формы.
- `protected abstract onInputChange(field: string, value: string): void` — вызывается при изменении инпутов.

Поведение:

- на `submit` предотвращает стандартную отправку и вызывает `onSubmit`;
- на `input` определяет имя поля и вызывает `onInputChange(field, value)`.

---

### Класс OrderForm

Файл: `src/components/view/OrderForm.ts`

Зона ответственности: первая форма оформления заказа — способ оплаты и адрес.

Конструктор:
`constructor(container: HTMLFormElement, events: IEvents)`

Поля:

- `addressInput: HTMLInputElement`;
- `cardButton: HTMLButtonElement`;
- `cashButton: HTMLButtonElement`.

Методы:

- `setPayment(payment?: TPayment): void` — выделяет выбранный способ оплаты, добавляя/удаляя модификатор `button_alt-active` с соответствующих кнопок.
- `setAddress(address?: string): void` — устанавливает значение поля адреса.
- `protected onSubmit(): void` — генерирует событие `order:submit`.
- `protected onInputChange(field: string, value: string): void` — при изменении поля `address` генерирует событие `order.address:change`.

События:

- при выборе «Оплата картой» генерирует `order.payment:change` с `payment: 'card'`;
- при выборе «Оплата при получении» генерирует `order.payment:change` с `payment: 'cash'`.

---

### Класс ContactsForm

Файл: `src/components/view/ContactsForm.ts`

Зона ответственности: вторая форма оформления заказа — контактные данные.

Конструктор:
`constructor(container: HTMLFormElement, events: IEvents)`

Поля:

- `emailInput: HTMLInputElement`;
- `phoneInput: HTMLInputElement`.

Методы:

- `setEmail(email?: string): void`;
- `setPhone(phone?: string): void`;
- `protected onSubmit(): void` — генерирует событие `contacts:submit`.
- `protected onInputChange(field: string, value: string): void` — генерирует `contacts.email:change` или `contacts.phone:change` в зависимости от имени поля.

---

### Класс Success

Файл: `src/components/view/Success.ts`

Зона ответственности: окно с результатом успешного оформления заказа.

Конструктор:
`constructor(container: HTMLElement, events: IEvents)`

Поля:

- `descriptionElement: HTMLElement` — строка вида «Списано N синапсов»;
- `closeButton: HTMLButtonElement` — кнопка «За новыми покупками!».

Методы:

- `setTotal(total: number): void` — устанавливает текст с суммой списанных «синапсов».
- `render(data?: Partial<{ total: number }>): HTMLElement` — при наличии `total` вызывает `setTotal`.

События:

- при клике по кнопке генерирует `success:close`.

---

## Презентер

Зона ответственности презентера реализована в файле `src/main.ts`. Отдельный класс презентера не выделен, но код организован по принципам MVP.

Основные шаги презентера:

1. Создаётся экземпляр `EventEmitter`.
2. Инициализируются модели:

   - `Products`,
   - `Cart`,
   - `Buyer`.
3. Инициализируются API:

   - `Api` с `API_URL`,
   - `LarekApi` на основе базового `Api`.
4. Создаются компоненты представления:

   - `Page` — для блока `.page__wrapper`;
   - `Modal` — для контейнера модального окна;
   - статичные компоненты `Basket`, `OrderForm`, `ContactsForm`, `Success`, а также экземпляр `PreviewCard`, созданный из шаблона и переиспользуемый при выборе разных товаров.
5. Презентер подписывается на события моделей (M → P) и обновляет представления:

   - `catalog:change` — пересобирает карточки каталога и рендерит их через `Page`;
   - `preview:change` — наполняет `PreviewCard` данными товара и открывает модальное окно;
   - `cart:change` — обновляет счётчик корзины на странице и содержимое представления `Basket`;
   - `buyer:change` и `buyerErrors:change` — обновляет данные и состояние валидности в формах `OrderForm` и `ContactsForm`.
6. Презентер подписывается на события представлений (V → P) и вызывает методы моделей:

   - `card:select` — выбирает товар в модели `Products`;
   - `card:buy` / `card:remove` — добавляет или удаляет товары в `Cart`;
   - `basket:open` / `basket:checkout` — открывает модальное окно корзины и первую форму оформления заказа;
   - события `order.payment:change`, `order.address:change`, `contacts.email:change`, `contacts.phone:change` — сохраняют данные покупателя через `Buyer.saveData`;
   - `order:submit` — при валидных данных первой формы открывает вторую форму;
   - `contacts:submit` — при валидных данных второй формы собирает объект `IOrder` с суммой `total`, отправляет его через `LarekApi.sendOrder`, при успешном ответе очищает корзину и данные покупателя и показывает окно успеха `Success`.
7. При старте приложения презентер запрашивает список товаров с сервера через `larekApi.getProducts()`. В случае ошибки использует локальные данные `apiProducts`.

Презентер не генерирует события сам по себе, а только обрабатывает события, поступающие от моделей и представлений.

---

## События в приложении

Ниже перечислены основные события и их источники.

События моделей данных (M → P):

- `catalog:change` — изменился список товаров (модель `Products`).
- `preview:change` — выбран новый товар для просмотра (`Products`).
- `cart:change` — изменилось содержимое корзины (`Cart`).
- `buyer:change` — изменились данные покупателя (`Buyer`).
- `buyerErrors:change` — изменился набор ошибок валидации покупателя (`Buyer`).

События представлений (V → P):

- `card:select` — пользователь кликнул по карточке товара в каталоге (`CatalogCard`).
- `card:buy` — пользователь нажал «Купить» в модальном окне (`PreviewCard`, через обработчик `onBuy`).
- `card:remove` — пользователь нажал «Удалить из корзины` в модальном окне (`PreviewCard`, через `onRemove`).
- `basket:open` — пользователь открыл корзину (клик по иконке корзины в шапке, компонент `Page`).
- `basket:checkout` — пользователь нажал «Оформить» в корзине (`Basket`).
- `basket:remove` — пользователь удалил товар из корзины по кнопке (`BasketCard`).
- `order.payment:change` — выбран способ оплаты в первой форме (`OrderForm`).
- `order.address:change` — изменён адрес доставки в первой форме (`OrderForm`).
- `order:submit` — пользователь нажал «Далее» на первой форме (`OrderForm`).
- `contacts.email:change` — изменён email во второй форме (`ContactsForm`).
- `contacts.phone:change` — изменён телефон во второй форме (`ContactsForm`).
- `contacts:submit` — пользователь нажал «Оплатить» на второй форме (`ContactsForm`).
- `success:close` — пользователь закрыл окно успешного оформления (`Success`).
- `modal:open` / `modal:close` — вспомогательные события открытия и закрытия модального окна (`Modal`).

Такое разделение позволяет придерживаться паттерна MVP:
данные хранятся только в моделях,
представления не принимают решений о бизнес-логике и не хранят бизнес-данные,
весь сценарий работы приложения описан в презентере.
