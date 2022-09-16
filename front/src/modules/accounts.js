import { el, setChildren } from 'redom';
import { createNewAccount } from './requests';
// eslint-disable-next-line import/no-cycle
import router from '../main';
import '../styles.scss';
import '../media.scss';

// форматирование даты
export function getDate(date) {
  let fullDate = '';
  if (!date) {
    fullDate = 'Транзакций еще не было';
  } else {
    const newDate = new Date(date);
    const day = newDate.getDate();
    const monthNumber = newDate.getMonth();
    let month = '';
    if (monthNumber === 2 || monthNumber === 7) {
      month = `${newDate.toLocaleString('ru', { month: 'long' })}а`;
    } else {
      month = `${newDate
        .toLocaleString('ru', { month: 'long' })
        .slice(0, -1)}я`;
    }
    const year = newDate.getFullYear();
    fullDate = `${day} ${month} ${year}`;
  }
  return fullDate;
}
// function dragstart(e) {
//   setTimeout(() => e.target.classList.add('card--hide'), 0);
// }

// function dragend(e) {
//   e.target.classList.remove('card--hide');
// }
// отрисовка карточки счета
function accountElementCreate(account, balance, date) {
  const fullDate = getDate(date);
  // const placeholder = el('div.accounts__placeholder');
  const card = el('div.accounts__card');
  const numberAccount = el('span.accounts__card-subject', account);
  const balanceAccount = el('span.accounts__card-sub', `${balance} ₽`);
  const bottomContainer = el('div.accounts__card-bottom-wrap');
  const dateTextAccount = el(
    'p.accounts__card-date-text',
    'Последняя транзакция:'
  );
  const dateAccount = el('p.accounts__card-date', fullDate);
  const linkAccount = el('a.accounts__card-btn', 'Открыть', {
    href: `/account/${account}`,
    onclick(event) {
      event.preventDefault();
      router.navigate(event.target.getAttribute('href'));
    },
  });

  // card.addEventListener('dragstart', dragstart);
  // card.addEventListener('dragend', dragend);

  dateTextAccount.append(dateAccount);
  setChildren(bottomContainer, [dateTextAccount, linkAccount]);
  setChildren(card, [numberAccount, balanceAccount, bottomContainer]);
  // setChildren(placeholder, card);

  return {
    card,
    numberAccount,
    balanceAccount,
    dateAccount,
    linkAccount,
    balance,
  };
}

// очищение списка
function resetList() {
  const items = document.querySelectorAll('.accounts__card');
  items.forEach((e) => {
    e.remove();
  });
}

// отрисовка списка счетов
function refreshAccountsList(accounts, list) {
  resetList();
  for (const element of accounts) {
    const lastTransaction = element.transactions;
    let card = null;
    if (lastTransaction.length === 0) {
      card = accountElementCreate(element.account, element.balance, null);
    } else {
      card = accountElementCreate(
        element.account,
        element.balance,
        element.transactions[0].date
      );
    }
    list.append(card.card);
  }
}

// сортировка счетов по балансу или номеру счета
function sortAccounts(array, property, dir = false) {
  return array.sort((x, y) =>
    // eslint-disable-next-line no-nested-ternary
    !dir ? x[property] > y[property] : x[property] < y[property] ? -1 : 1
  );
}

// сортировка счетов по дате последней транзакции
function sortAccountsOnDate(array, property, dir = false) {
  return array.sort((x, y) =>
    // eslint-disable-next-line no-nested-ternary
    !dir
      ? x[property][0].date > y[property][0].date
      : x[property][0].date < y[property][0].date
      ? -1
      : 1
  );
}

// перерисовка счетов с сортировкой
function refreshAccountListWithSort(accounts, property, isDate) {
  const arr = isDate
    ? sortAccountsOnDate(accounts, property, true)
    : sortAccounts(accounts, property, true);
  const list = document.querySelector('.accounts__list');
  refreshAccountsList(arr, list);
}

// создание нового счета
async function createNewAccountElement() {
  const newAccount = await createNewAccount(sessionStorage.getItem('token'));
  const newAccountElement = accountElementCreate(
    newAccount.payload.account,
    newAccount.payload.balance,
    null
  );
  document.querySelector('.accounts__list').append(newAccountElement.card);
}

// отрисовка секии счетов
export function accountsViewCreate(accounts) {
  if (!sessionStorage.getItem('token')) {
    throw new Error('Вы не авторизованы');
  }

  const section = el('section.accounts');
  const title = el('h2.accounts__title', 'Ваши счета');
  const select = el('select.accounts__select');
  const optionsSort = el('option', 'Сортировка', {
    value: '',
    selected: true,
    hidden: true,
  });
  const optionsNumber = el('option', 'По номеру', { value: 'account' });
  const optionsBalance = el('option', 'По балансу', { value: 'balance' });
  const optionsDateTransaction = el('option', 'По последней транзакции', {
    value: 'transactions',
  });
  setChildren(select, [
    optionsSort,
    optionsBalance,
    optionsNumber,
    optionsDateTransaction,
  ]);
  const btnCreateAcc = el('button.accounts__btn.btn', '+ Создать новый счёт');
  const container = el('div.accounts__up-container');
  const ul = el('ul.accounts__list.list-reset');

  refreshAccountsList(accounts, ul);

  btnCreateAcc.addEventListener('click', async () => {
    createNewAccountElement();
  });

  select.addEventListener('change', () => {
    const isDate = select.value === 'transactions';

    if (isDate) {
      const accountsWithTransactions = [];
      accounts.forEach((acc) => {
        if (acc.transactions.length > 0) {
          accountsWithTransactions.push(acc);
        }
      });
      refreshAccountListWithSort(
        accountsWithTransactions,
        select.value,
        isDate
      );
    } else refreshAccountListWithSort(accounts, select.value, isDate);
  });

  if (!sessionStorage.getItem('token')) {
    throw new Error('Вы не авторизованы');
  }

  setChildren(container, [title, select, btnCreateAcc]);
  setChildren(section, [container, ul]);

  return { section, select, btnCreateAcc, ul };
}

// скелетон
export function accountsSkeleton() {
  const section = el('section.skeleton__section');
  const title = el('h2.skeleton__header');
  const select = el('div.skeleton__select');
  const wrap = el('div.skeleton__up-container');

  const btnCreateAcc = el('button.skeleton__btn.btn');
  const container = el('div.skeleton__up-container');
  const ul = el('ul.skeleton__list.list-reset');

  let i = 0;
  while (i < 10) {
    const card = el('div.skeleton__card');
    const numberAccount = el('span.skeleton__card-subject');
    const balanceAccount = el('span.skeleton__card-subject');
    const bottomContainer = el('div.accounts__card-bottom-wrap');
    const linkAccount = el('button.skeleton__btn.btn');

    setChildren(wrap, [title, select]);
    setChildren(bottomContainer, [linkAccount]);
    setChildren(card, [numberAccount, balanceAccount, bottomContainer]);
    ul.append(card);
    i++;
  }

  setChildren(container, [wrap, btnCreateAcc]);
  setChildren(section, [container, ul]);

  return section;
}
