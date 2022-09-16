import { el, setChildren, mount } from 'redom';
import {
  requestMyCurrencies,
  transferCurrency,
  requestCurrencies,
} from './requests';
import { modalCreate } from './modals';
import { validationAmount } from './validation';
import currencyUp from '../assets/img/currency-up.svg';
import currencyDown from '../assets/img/currency-down.svg';
import '../styles.scss';
import '../media.scss';

// мои валюты
async function myCurrenciesBoard() {
  const myCurrencies = await requestMyCurrencies(
    sessionStorage.getItem('token')
  );

  const boxMyCurrencies = el('div.currency__box');
  const title = el('h3.currency__caption', 'Ваши валюты');
  const ul = el('div.currency__up-box-list.list-reset');

  for (const key in myCurrencies.payload) {
    if (key) {
      const name = el(
        'span.currency__code-currency',
        myCurrencies.payload[key].code
      );
      const separator = el('span.currency__separator');
      const value = el(
        'span.currency__value-currency',
        myCurrencies.payload[key].amount
      );
      if (myCurrencies.payload[key].amount > 0) {
        const li = el('li.currency__item');
        setChildren(li, [name, separator, value]);
        ul.append(li);
      }
    }
  }
  setChildren(boxMyCurrencies, [title, ul]);
  return boxMyCurrencies;
}

// изменение курса валют
function changeScoreboardCurrencies(data, ul) {
  if (data.type === 'EXCHANGE_RATE_CHANGE') {
    if (data.change !== 0) {
      const name = el(
        'span.currency__code-currency',
        `${data.from}/${data.to}`
      );
      const separator = el('span.currency__separator-tabel');
      const value = el('span.currency__value-currency', data.rate);
      const valueWrap = el('div.currency__value-wrap');
      let icon = null;
      if (data.change === 1) {
        icon = el('img.currency__icon', {
          src: currencyUp,
        });
        separator.classList.add('border-color-plus');
      } else if (data.change === -1) {
        icon = el('img.currency__icon', {
          src: currencyDown,
        });
        separator.classList.add('border-color-minus');
      }
      setChildren(valueWrap, [value, icon]);
      const li = el('li.currency__item');
      setChildren(li, [name, separator, valueWrap]);
      ul.prepend(li);
      if (ul.children.length > 21) {
        ul.children[21].remove();
      }
    }
  }
}

// табло курса валют
function scoreboardCurrencies() {
  const container = el('div.currency__table');
  const title = el(
    'h3.currency__caption',
    'Изменение курсов в реальном времени'
  );
  const ul = el('div.currency__up-box-list.list-reset');

  const socket = new WebSocket('ws://localhost:3000/currency-feed');
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    changeScoreboardCurrencies(data, ul);
    if (document.location.pathname !== '/currency') {
      socket.close();
    }
  };
  socket.onerror = (error) => {
    modalCreate(`Соединение прервано из за ошибки ${error.message}`, 'Ошибка');
  };

  setChildren(container, [title, ul]);

  return container;
}

// перевод валюты
async function transferCurrencies(from, to, amount, myCurrencies) {
  const data = { from, to, amount };
  let balance = 0;
  for (const key in myCurrencies.payload) {
    if (myCurrencies.payload[key].code === from) {
      balance = myCurrencies.payload[key].amount;
    }
  }
  const valid = validationAmount(amount, balance);
  if (valid === -1) {
    modalCreate('Сумма не может быть меньше нуля', 'Ошибка');
  } else if (valid === null) {
    modalCreate('У вас недостаточно средств', 'Ошибка');
  } else if (valid > 0) {
    await transferCurrency(sessionStorage.getItem('token'), data);
    modalCreate('Ваш платеж успешно обработан', 'Все хорошо');
    const tablo = await myCurrenciesBoard();
    mount(
      document.querySelector('.currency__left-box'),
      tablo,
      document.querySelector('.currency__box'),
      true
    );
  }
}

// обмен валюты форма
async function currencyExchange(myCurrencies) {
  const boxForm = el('div.currency__box');
  const title = el('h3.currency__caption', 'Обмен валюты');
  const form = el('form.currency__form');
  const selectsWrap = el('div.currency__wrap');
  const span1 = el('span.currency__text', 'Из');
  const select1 = el('select.currency__select.#select1');
  const span2 = el('span.currency__text', 'в');
  const select2 = el('select.currency__select.#select2');
  const inputWrap = el('div.currency__wrap');
  const span3 = el('span.currency__text', 'Сумма');
  const input = el('input.currency__input', {
    type: 'number',
    step: 'any',
  });
  const formWrap = el('div.currency__form-wrap');
  const btn = el('button.currency__btn.btn', 'Обменять');

  const currencies = await requestCurrencies(sessionStorage.getItem('token'));

  currencies.payload.forEach((cur) => {
    const option1 = el('option', cur, { value: cur });
    const option2 = el('option', cur, { value: cur });
    select1.append(option1);
    select2.append(option2);
  });

  select2.selectedIndex = 1;

  // изменение значений селекта в зависимости от выбора первого селекта
  function changeDynamicly() {
    select2.selectedIndex =
      this.selectedIndex === 14 ? 0 : this.selectedIndex + 1;
    for (let i = 0; i < select2.length; i++) {
      select2[i].disabled = false;
    }
    select2[this.selectedIndex].disabled = true;
  }

  select1.addEventListener('change', changeDynamicly);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    await transferCurrencies(
      select1.value,
      select2.value,
      input.value,
      myCurrencies
    );
    input.value = '';
  });

  setChildren(selectsWrap, [span1, select1, span2, select2]);
  setChildren(inputWrap, [span3, input]);
  setChildren(formWrap, [selectsWrap, inputWrap]);
  setChildren(form, [formWrap, btn]);
  setChildren(boxForm, [title, form]);

  return boxForm;
}

// отрисовка секции валютный обмен
export async function createCurrencyExchange() {
  if (!sessionStorage.getItem('token')) {
    throw new Error('Вы не авторизованы');
  }

  const container = el('div.currency');
  const wrap = el('div.currency__box-wrap');
  const leftBox = el('div.currency__left-box');
  const rightBox = el('div.currency__right-box');
  const title = el('h2.currency__title', 'Валютный обмен');

  const myCurrencies = await requestMyCurrencies(
    sessionStorage.getItem('token')
  );

  const currencies = await myCurrenciesBoard();
  const form = await currencyExchange(myCurrencies);
  const scoreBoard = scoreboardCurrencies();

  setChildren(leftBox, [currencies, form]);
  setChildren(rightBox, scoreBoard);
  setChildren(wrap, [leftBox, rightBox]);
  setChildren(container, [title, wrap]);

  return container;
}

// скелетон
export function currencySkeleton() {
  const section = el('section.skeleton__section');
  const title = el('h2.skeleton__header');
  const wrap = el('div.skeleton__container-col');
  const container = el('div.skeleton__up-container');

  const div1 = el('div.skeleton__box');
  const div2 = el('div.skeleton__box');
  const table = el('div.skeleton__table');

  setChildren(wrap, [div1, div2]);
  setChildren(container, [wrap, table]);

  setChildren(section, [title, container]);

  return section;
}
