/* eslint-disable import/no-cycle */
import { el, setChildren, mount } from 'redom';
import Highcharts from 'highcharts';
import Exporting from 'highcharts/modules/exporting';
import binking from 'binking';
import { transferMoney, requestInfoAccounts } from './requests';
import { modalCreate } from './modals';
import { getDate } from './accounts';
import router from '../main';
import { validationAmount, validationCardNumber } from './validation';
import '../styles.scss';
import '../media.scss';
import iconArrow from '../assets/img/arrow.svg';
import iconMail from '../assets/img/mail.svg';

Exporting(Highcharts);

binking.setDefaultOptions({
  strategy: 'api',
  apiKey: '99723aee7b007635c7fbac1f89d40177',
  brandLogoPolicy: 'colored',
});

// Автозаполнение в поиске
function autocomplete(inp) {
  const clients = JSON.parse(localStorage.getItem('accountTransfer'));
  const arr = [];
  if (clients) {
    clients.forEach((account) => {
      arr.push(account);
    });
  }

  function removeActive(x) {
    for (let i = 0; i < x.length; i++) {
      x[i].classList.remove('autocomplete-active');
    }
  }
  function closeAllLists(elmnt) {
    const x = document.getElementsByClassName('autocomplete-items');
    for (let i = 0; i < x.length; i++) {
      if (elmnt !== x[i] && elmnt !== inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }

  let currentFocus = null;
  // eslint-disable-next-line func-names, consistent-return
  inp.addEventListener('input', function () {
    let a = this.value;
    let b = this.value;
    let i = this.value;
    const val = this.value;
    closeAllLists();
    if (!val) {
      return false;
    }
    currentFocus = -1;
    a = el('div.autocomplete-items');
    a.setAttribute('id', `${this.id}autocomplete-list`);

    this.parentNode.appendChild(a);
    for (i = 0; i < arr.length; i++) {
      if (arr[i].toUpperCase().includes(val.toUpperCase())) {
        b = el('div.autocomplete-item');
        b.innerHTML = `<strong>${arr[i].substr(0, val.length)}</strong>`;
        b.innerHTML += arr[i].substr(val.length);
        b.innerHTML += `<input type='hidden' value='${arr[i]}'>`;
        // eslint-disable-next-line func-names
        b.addEventListener('click', function () {
          inp.value = this.getElementsByTagName('input')[0].value;
          closeAllLists();
        });
        a.appendChild(b);
      }
    }
  });

  // eslint-disable-next-line consistent-return
  function addActive(x) {
    if (!x) return false;
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = x.length - 1;
    x[currentFocus].classList.add('autocomplete-active');
  }

  // eslint-disable-next-line func-names
  inp.addEventListener('keydown', function (e) {
    let x = document.getElementById(`${this.id}autocomplete-list`);
    if (x) x = x.getElementsByTagName('div');
    if (e.keyCode === 40) {
      currentFocus++;
      addActive(x);
    } else if (e.keyCode === 38) {
      currentFocus--;
      addActive(x);
    } else if (e.keyCode === 13) {
      e.preventDefault();
      if (currentFocus > -1) {
        if (x) x[currentFocus].click();
      }
    }
  });

  document.addEventListener('click', (e) => {
    closeAllLists(e.target);
  });
}

// создание строки таблицы
export function createTableRow(transaction, number) {
  const tabelRow = el('tr.info__table-tr');
  const tabelNumberSend = el('td.info__tabel-td', transaction.from);
  const tabelNumberReceiver = el('td.info__tabel-td', transaction.to);
  const tabelNumber = el('td.info__tabel-td');
  let amount = transaction.amount.toString();
  if (transaction.from === number) {
    amount = `- ${amount} ₽`;
    tabelNumber.classList.add('color-minus');
  } else {
    amount = `+ ${amount} ₽`;
    tabelNumber.classList.add('color-plus');
  }
  tabelNumber.textContent = amount;
  const tabelDate = el('td.info__tabel-td', getDate(transaction.date));

  setChildren(tabelRow, [
    tabelNumberSend,
    tabelNumberReceiver,
    tabelNumber,
    tabelDate,
  ]);
  return tabelRow;
}

// Определение логотипа платежной системы
function getPaymentIcon(value, img) {
  binking(value, (result) => {
    if (result.formBrandLogoSvg) {
      img.src = result.formBrandLogoSvg;
      img.classList.remove('binking__hide');
    } else {
      img.classList.add('binking__hide');
    }
  });
}

// запись номеров счетов в localStorage
function saveToLocalStorage(numberTransfer) {
  if (!localStorage.getItem('accountTransfer')) {
    const historyAccounts = [];
    historyAccounts.push(numberTransfer);
    localStorage.setItem('accountTransfer', JSON.stringify(historyAccounts));
  } else {
    const historyAccounts = JSON.parse(localStorage.getItem('accountTransfer'));
    if (!historyAccounts.includes(numberTransfer)) {
      historyAccounts.push(numberTransfer);
    }
    localStorage.setItem('accountTransfer', JSON.stringify(historyAccounts));
  }
}

// деление массива
export function sliceIntoChunks(arr, chunkSize) {
  const res = [];
  const reverseArr = arr.reverse();
  for (let i = 0; i < reverseArr.length; i += chunkSize) {
    const chunk = reverseArr.slice(i, i + chunkSize);
    res.push(chunk);
  }
  res.unshift([]);
  return res;
}

// история транзакций в секции подробной информации
export function historyInfoAccountCreate(
  transactions,
  number,
  rows,
  count,
  flag
) {
  const bottomContainer = el('div.info__table-container');
  const historyTitle = el('h3.info__block-title', 'История переводов');
  const table = el('table.info__table');
  const thead = el('thead.info__thead');
  const thAccountSender = el('th.info__table-th', 'Счёт отправителя');
  const thAccountReceiver = el('th.info__table-th', 'Счёт получателя');
  const thNumber = el('th.info__table-th', 'Сумма');
  const thDate = el('th.info__table-th', 'Дата');
  const tbody = el('tbody.info__tbody');

  if (transactions.length !== 0) {
    const arr = sliceIntoChunks(transactions, rows);
    for (let i = 0; i < arr[count].length; i++) {
      const row = createTableRow(arr[count][i], number);
      tbody.append(row);
    }
  }

  if (flag) {
    bottomContainer.addEventListener('click', (event) => {
      event.preventDefault();
      router.navigate(`${window.location.pathname}/info`);
    });
  }

  setChildren(thead, [thAccountSender, thAccountReceiver, thNumber, thDate]);
  setChildren(table, [thead, tbody]);
  setChildren(bottomContainer, [historyTitle, table]);

  return bottomContainer;
}

// перевод средств
async function transfer(number, numberTransfer, value) {
  const account = await requestInfoAccounts(
    number,
    sessionStorage.getItem('token')
  );
  const validAccount = validationCardNumber(numberTransfer);

  const amount = validationAmount(value, account.payload.balance);
  if (
    amount > 0 &&
    validAccount === undefined &&
    number !== numberTransfer &&
    numberTransfer.length <= 26
  ) {
    const data = {
      from: number, // счёт с которого списываются средства
      to: numberTransfer, // счёт, на который зачисляются средства
      amount, // сумма для перевода
    };
    transferMoney(sessionStorage.getItem('token'), data);
    const updateAccount = await requestInfoAccounts(
      number,
      sessionStorage.getItem('token')
    );
    const history = historyInfoAccountCreate(
      updateAccount.payload.transactions,
      number,
      10,
      1,
      true
    );
    mount(
      document.querySelector('.info'),
      history,
      document.querySelector('.info__table-container'),
      true
    );
    saveToLocalStorage(numberTransfer);
    modalCreate('Ваш платеж успешно обработан', 'Все хорошо');
  } else if (amount < 0) {
    modalCreate('Сумма не может быть меньше нуля', 'Ошибка');
  } else if (number === numberTransfer) {
    modalCreate(
      'Вы не можете перевести на тот же счет,с которого отправляете',
      'Ошибка'
    );
  } else if (numberTransfer.length > 26) {
    modalCreate('Номер счета некорректен', 'Ошибка');
  } else if (amount === null) {
    modalCreate('У вас недостаточно средств', 'Ошибка');
  } else if (validAccount !== undefined) {
    modalCreate('Ошибка в номере карты', 'Ошибка');
  }
}

// фильтрация транзакций под график
export function getMapForDiagram(transactions, period, number) {
  const arrDates = [];
  const arrMonth = [];
  const arrMonthString = [];
  const mapAmount = new Map();
  const mapCosts = new Map();
  const mapProfit = new Map();

  transactions.forEach((tr) => {
    // сегодняшний день
    const today = new Date();
    // период в пол года
    today.setMonth(today.getMonth() - period);
    // сравниваем,чтобы даты были не позднее полугода
    if (new Date(tr.date) > today) {
      // все транзакции за период
      arrDates.push(tr);
      // все месяца в периоде
      const months = new Date(tr.date).getMonth() + 1;
      if (!arrMonth.includes(months)) {
        arrMonth.push(months);
        // месяца в строковом формате
        arrMonthString.push(
          `${new Date(tr.date)
            .toLocaleString('ru', { month: 'long' })
            .slice(0, 3)}`
        );
      }
    }
  });

  // массив с месяцами
  for (let i = 0; i < arrMonth.length; i++) {
    // месяц в массиве
    const month = arrMonth[i];
    const monthString = arrMonthString[i];
    let totalAmounth = 0;
    let totalCosts = 0;
    let totalProfit = 0;
    // сумма за текщий месяц
    arrDates.forEach((val) => {
      // вся динамика
      if (month === new Date(val.date).getMonth() + 1) {
        totalAmounth =
          Math.round((totalAmounth + Number(val.amount)) * 1000) / 1000;
        // расходы
        if (val.from === number) {
          totalCosts =
            Math.round((totalCosts + Number(val.amount)) * 1000) / 1000;
          // доходы
        } else {
          totalProfit =
            Math.round((totalProfit + Number(val.amount)) * 1000) / 1000;
        }
      }
    });

    mapProfit.set(monthString, totalProfit);
    mapAmount.set(monthString, totalAmounth);
    mapCosts.set(monthString, totalCosts);
  }

  return { mapAmount, mapCosts, mapProfit };
}

// общая информация в секции подробной информации
export function headInfoAccountCreate(number, balance, hrefBack, caption) {
  const upContainer = el('div.info__extra-container');
  const title = el('h2.info__title', caption);
  const numberAccount = el('span.info__sub', `№ ${number}`);
  const leftWrap = el('div.info__wrap');
  const btnBackIcon = el('img.info__btn-icon', {
    src: iconArrow,
  });
  const btnBack = el('a.info__btn', 'Вернуться назад', {
    href: hrefBack,
    onclick(event) {
      event.preventDefault();
      router.navigate(hrefBack);
    },
  });
  const balanceWrap = el('div.info__wrap');
  const balanceText = el('span.info__text', 'Баланс');
  const balanceInfo = el('span.info__text-sub', `${balance} ₽`);
  const rightWrap = el('div.info__wrap');

  btnBack.prepend(btnBackIcon);
  setChildren(leftWrap, [title, numberAccount]);
  setChildren(balanceWrap, [balanceText, balanceInfo]);
  setChildren(rightWrap, [btnBack, balanceWrap]);
  setChildren(upContainer, [leftWrap, rightWrap]);

  return upContainer;
}

// форма перевода в секции подробной информации
function formInfoAccountCreate(number) {
  const leftBlock = el('div.info__block-left');
  const leftBlockTitle = el('h3.info__block-title', 'Новый перевод');
  const img = el('img.info__img');
  const form = el('form.info__block-form');
  const formLeftWrap = el('div.info__block-wrap');
  const formAccountText = el(
    'span.info__block-subject',
    'Номер счёта получателя'
  );
  const inputAccount = el('input.info__block-input', {
    placeholder: 'Введите номер счета или карты',
    type: 'number',
    step: 'any',
  });
  const formRightWrap = el('div.info__block-wrap');
  const formNumberText = el('span.info__block-subject', 'Сумма перевода');
  const inputNumber = el('input.info__block-input', {
    placeholder: 'Введите сумму',
    type: 'number',
  });
  const blockBtnIcon = el('img.info__btn-icon', { src: iconMail });
  const blockBtn = el('button.info__block-btn.btn', 'Отправить');
  blockBtn.prepend(blockBtnIcon);

  setChildren(formLeftWrap, [formAccountText, formNumberText]);
  setChildren(formRightWrap, [inputAccount, inputNumber, blockBtn]);
  setChildren(form, [formLeftWrap, formRightWrap]);
  setChildren(leftBlock, [leftBlockTitle, img, form]);

  inputAccount.addEventListener('input', () => {
    autocomplete(inputAccount);
  });

  inputAccount.addEventListener('blur', () => {
    getPaymentIcon(inputAccount.value, img);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    transfer(number, inputAccount.value, inputNumber.value, img);
    inputAccount.value = '';
    inputNumber.value = '';
    img.src = '';
  });

  return leftBlock;
}

// диаграмма в секции подробной информации
export function diagrammInfoAccountCreate(
  transactions,
  number,
  month,
  widthStr,
  flag
) {
  const rightBlock = el('div.info__block-right');
  const rightBlockTitle = el('h3.info__block-title', 'Динамика баланса');
  const diagramLink = el('a.info__diagram-link');
  if (flag) {
    diagramLink.setAttribute('href', `/account/${number}/info`);
    diagramLink.addEventListener('click', (event) => {
      event.preventDefault();
      router.navigate(`${window.location.pathname}/info`);
    });
  }

  const diagramBlock = el('div.info__diagram-container');
  const diagramContainer = el('div.info__diagram');
  const max = el('span.info__diagramm-text');
  const min = el('span.info__diagramm-text');
  const blockMinMax = el('div.info__diagram-info-wrap');

  if (transactions.length !== 0) {
    const map = getMapForDiagram(transactions, month, number);
    Highcharts.chart(diagramContainer, {
      chart: {
        renderTo: 'chart',
        type: 'column',
        width: widthStr,
      },
      title: {
        text: '',
      },
      xAxis: {
        categories: Array.from(map.mapAmount.keys()),
      },
      yAxis: {
        min: 0,
        title: {
          text: '',
        },
      },
      tooltip: {
        pointFormat:
          '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
        shared: true,
      },
      plotOptions: {
        column: {
          stacking: '',
        },
      },
      series: [
        {
          name: 'Amount',
          data: Array.from(map.mapAmount.values()),
          color: '#116ACC',
          fontSize: '25px',
        },
      ],
    });

    max.textContent = Math.max(...Array.from(map.mapAmount.values()));
    min.textContent = Math.min(...Array.from(map.mapAmount.values()));
  }

  setChildren(blockMinMax, [max, min]);
  setChildren(diagramBlock, [diagramContainer, blockMinMax]);

  setChildren(rightBlock, [rightBlockTitle, diagramBlock]);
  setChildren(diagramLink, rightBlock);

  return diagramLink;
}

// отрисовка подробной информаци о счете
export function infoAccountCreate(number, balance, transactions) {
  if (!sessionStorage.getItem('token')) {
    throw new Error('Вы не авторизованы');
  }

  const container = el('div.info');
  const middleContainer = el('div.info__extra-container');

  const headInfoAccount = headInfoAccountCreate(
    number,
    balance,
    '/accounts',
    'Просмотр счёта'
  );
  const formInfoAccount = formInfoAccountCreate(number);
  const diagramInfoAccount = diagrammInfoAccountCreate(
    transactions,
    number,
    6,
    510,
    true
  );
  const historyInfoAccount = historyInfoAccountCreate(
    transactions,
    number,
    10,
    1,
    true
  );

  setChildren(middleContainer, [formInfoAccount, diagramInfoAccount]);
  setChildren(container, [
    headInfoAccount,
    middleContainer,
    historyInfoAccount,
  ]);

  return container;
}

// скелетон
export function infoSkeleton() {
  const section = el('section.skeleton__section');
  const title = el('h2.skeleton__header');
  const wrap = el('div.skeleton__up-container');

  const btnCreateAcc = el('button.skeleton__btn.btn');
  const container = el('div.skeleton__up-container');

  const wrapDiv = el('div.skeleton__up-container ');

  const div1 = el('div.skeleton__box');
  const div2 = el('div.skeleton__box');
  const table = el('div.skeleton__table');
  setChildren(wrap, [title, btnCreateAcc]);
  setChildren(wrapDiv, [div1, div2]);
  setChildren(container, wrap);
  setChildren(section, [container, wrapDiv, table]);

  return section;
}
