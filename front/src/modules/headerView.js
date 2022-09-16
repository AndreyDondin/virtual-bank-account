import { el, setChildren } from 'redom';
// eslint-disable-next-line import/no-cycle
import router from '../main';
import '../styles.scss';
import '../media.scss';

// хедар без навигации
export function headerViewCreate() {
  const headerContainer = el('div.header__container');
  const logo = el('h1.header__logo', 'coin.');

  setChildren(headerContainer, logo);
  return headerContainer;
}
// хедар с навигацией
export function headerViewAfterLoginCreate() {
  const headerContainer = el('div.header__container');
  const logo = el('h1.header__logo', 'coin.');
  const nav = el('nav.header__nav');
  const ul = el('ul.header__list.list-reset');
  const liAtm = el('li.header__item');
  const liAccounts = el('li.header__item');
  const liCurrency = el('li.header__item');
  const liExit = el('li.header__item');

  const linkAtm = el('a.header__link', 'Банкоматы', {
    href: '/atm',
    onclick(event) {
      event.preventDefault();
      router.navigate('/atm');
    },
  });
  const linkAccounts = el('a.header__link', 'Счета', {
    href: '/accounts',
    onclick(event) {
      event.preventDefault();
      router.navigate('/accounts');
    },
  });
  const linkCurrency = el('a.header__link', 'Валюта', {
    href: '/currency',
    onclick(event) {
      event.preventDefault();
      router.navigate('/currency');
    },
  });
  const linkExit = el('a.header__link', 'Выйти', {
    href: '/',
    onclick(event) {
      event.preventDefault();
      router.navigate('/');
    },
  });

  setChildren(liAtm, linkAtm);
  setChildren(liAccounts, linkAccounts);
  setChildren(liCurrency, linkCurrency);
  setChildren(liExit, linkExit);

  setChildren(ul, [liAtm, liAccounts, liCurrency, liExit]);
  setChildren(nav, ul);
  setChildren(headerContainer, [logo, nav]);

  return {
    headerContainer,
    liAtm,
    liAccounts,
    liCurrency,
    liExit,
    linkAtm,
    linkAccounts,
    linkCurrency,
    linkExit,
  };
}

// скелетон
export function headerSkeleton() {
  const headerContainer = el('div.skeleton__container');
  const logo = el('h1.skeleton__header');
  const ul = el('ul.skeleton__list.list-reset');
  const liAtm = el('li.skeleton__item');
  const liAccounts = el('li.skeleton__item');
  const liCurrency = el('li.skeleton__item');
  const liExit = el('li.skeleton__item');

  setChildren(ul, [liAtm, liAccounts, liCurrency, liExit]);
  setChildren(headerContainer, [logo, ul]);

  return {
    headerContainer,
  };
}
