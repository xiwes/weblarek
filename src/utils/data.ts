// src/utils/data.ts

import { IProduct } from '../types';

export const apiProducts: { total: number; items: IProduct[] } = {
  total: 10,
  items: [
    {
      id: '854cef69-976d-4c2a-a18c-2aa45046c390',
      title: '+1 час в сутках',
      description: 'Дополнительный час в дне, чтобы успеть всё: учёбу, проекты и жизнь.',
      image: '/5_Dots.svg',
      category: 'софт-скил',
      price: 750,
    },
    {
      id: 'c101ab44-ed99-4a54-990d-47aa2bb4e7d9',
      title: 'HEX-леденец',
      description: 'Леденец, после которого вы мгновенно запоминаете любые цветовые коды.',
      image: '/Shell.svg',
      category: 'другое',
      price: 1450,
    },
    {
      id: 'b06cde61-912f-4663-9751-09956c0eed67',
      title: 'Мамка-таймер',
      description: 'Мотивирующий таймер, который не даёт прокрастинировать и всё откладывать.',
      image: '/Asterisk_2.svg',
      category: 'софт-скил',
      price: null, // «Бесценно» на макете
    },
    {
      id: '412bcf81-7e75-4e70-bdb9-d3c73c9803b7',
      title: 'Фреймворк куки судьбы',
      description: 'Открой печенье и узнай, какой фреймворк стоит изучить следующим.',
      image: '/Soft_Flower.svg',
      category: 'дополнительное',
      price: 2500,
    },
    {
      id: 'd1fb4793-5a31-4ce6-a2a2-2e47b91e5a11',
      title: 'Кнопка «Замьючить кота»',
      description: 'Волшебная кнопка, которая на время отключает ночные концерты питомца.',
      image: '/Cat.svg',
      category: 'кнопка',
      price: 2000,
    },
    {
      id: 'f9c3af71-0a6e-4b71-8c37-8b10a5210f92',
      title: 'БЭМ-пилюлька',
      description: 'После приёма БЭМ-схемы именования становятся понятными и естественными.',
      image: '/Pill.svg',
      category: 'другое',
      price: 1500,
    },
    {
      id: 'a3c399f1-3c11-4d58-8a8b-32c6b4e5f201',
      title: 'Портативный телепорт',
      description: 'Мгновенный перенос из кровати за рабочий стол — без боли и страданий.',
      image: '/Hexagon.svg',
      category: 'другое',
      price: 100000,
    },
    {
      id: 'e2f4c95a-2a7a-4c94-9a62-fbf91b0c0e13',
      title: 'Микровселенная в кармане',
      description: 'Личный маленький мирок, в котором всегда есть время на ваши проекты.',
      image: '/Butterfly.svg',
      category: 'другое',
      price: 150000,
    },
    {
      id: '7b8d40ba-7c73-4d6a-9e73-0b7be9e5f9e4',
      title: 'UI/UX-карандаш',
      description: 'Карандаш, которым невозможно нарисовать плохой интерфейс.',
      image: '/Leaf.svg',
      category: 'хард-скил',
      price: 10000,
    },
    {
      id: '9c2e5a6d-2b94-4c1e-8c70-8e404f76ecb7',
      title: 'Бэкенд-антистресс',
      description: 'Мятный антистресс для тех, кто часами ловит баг в проде.',
      image: '/Bean.svg',
      category: 'другое',
      price: 1000,
    },
  ],
};
