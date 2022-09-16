/* eslint-disable import/no-cycle */
import { el, setChildren } from 'redom';
import Navigo from 'navigo';
import loginViewCreate from './modules/login';
import {
  headerViewCreate,
  headerViewAfterLoginCreate,
  headerSkeleton,
} from './modules/headerView';
import { requestAccounts, requestInfoAccounts } from './modules/requests';
import { modalCreate } from './modules/modals';
import { accountsViewCreate, accountsSkeleton } from './modules/accounts';
import { infoAccountCreate, infoSkeleton } from './modules/infoAccount';
import {
  infoHistoryAccountCreate,
  infoHistorySkeleton,
} from './modules/infoHistoryAccount';
import createAtmInfo from './modules/atm';
import { createCurrencyExchange, currencySkeleton } from './modules/currency';
import './styles.scss';
import './media.scss';

const router = new Navigo('/');
// eslint-disable-next-line no-restricted-exports
export { router as default };

const header = el('header.header');
const main = el('main.container');
const loginView = loginViewCreate(router);
const headerView = headerViewCreate();

setChildren(document.body, [header, main]);
let nIntervId = null;

// показ модалки,если что-то пошло не так
function timer() {
  modalCreate('Что-то пошло не так,попробуйте перезайти в систему', 'Ошибка');
  router.navigate('/');
  clearInterval(nIntervId);
}
// скелетон хедара
function headerSk() {
  const skeleton = headerSkeleton();
  setChildren(header, skeleton.headerContainer);
}
// drag and drop в секции со счетами
// function dragAndDropInAccounts() {
//   const placeholders = document.querySelectorAll('.accounts__placeholder');
//   let currentCard = null;
//   let parent = null;
//   placeholders.forEach((place) => {
//     place.addEventListener('dragstart', () => {
//       currentCard = place.querySelector('.accounts__card');
//       parent = place.querySelector('.accounts__card').parentNode;
//     });
//     place.addEventListener('dragenter', () => {
//       place.classList.add('hovered');
//     });

//     place.addEventListener('dragover', (e) => {
//       e.preventDefault();
//     });

//     place.addEventListener('dragleave', () => {
//       place.classList.remove('hovered');
//     });

//     place.addEventListener('drop', () => {
//       const thisCard = place.querySelector('.accounts__card');
//       const parent2 = place.querySelector('.accounts__card').parentNode;
//       parent.append(thisCard);
//       parent2.append(currentCard);
//       place.classList.remove('hovered');
//     });
//   });
// }

// роутинг
router
  .on('/', () => {
    sessionStorage.clear();
    setChildren(header, headerView);
    setChildren(main, loginView.section);
  })
  .on('/accounts', async () => {
    headerSk();
    setChildren(main, accountsSkeleton());
    try {
      const account = await requestAccounts(
        'accounts',
        sessionStorage.getItem('token')
      );
      const accounts = accountsViewCreate(account.payload);
      const headerViewAfterAuthorization = headerViewAfterLoginCreate();
      setChildren(header, headerViewAfterAuthorization.headerContainer);
      setChildren(main, accounts.section);
      // dragAndDropInAccounts();
      headerViewAfterAuthorization.linkAccounts.classList.add(
        'header__item--active'
      );
    } catch (error) {
      console.log(error);
      nIntervId = setInterval(timer, 1500);
    }
  })
  .on('/account/:id', async ({ data: { id } }) => {
    headerSk();
    setChildren(main, infoSkeleton());
    try {
      const requestNumberAccount = await requestInfoAccounts(
        id,
        sessionStorage.getItem('token')
      );
      const infoAccountView = infoAccountCreate(
        requestNumberAccount.payload.account,
        requestNumberAccount.payload.balance,
        requestNumberAccount.payload.transactions
      );
      const headerViewAfterAuthorization = headerViewAfterLoginCreate();
      setChildren(header, headerViewAfterAuthorization.headerContainer);
      setChildren(main, infoAccountView);
      headerViewAfterAuthorization.linkAccounts.classList.add(
        'header__item--active'
      );
    } catch (error) {
      console.log(error);
      nIntervId = setInterval(timer, 1500);
    }
  })
  .on('/account/:id/info', async ({ data: { id } }) => {
    headerSk();
    setChildren(main, infoHistorySkeleton());
    try {
      const requestNumberAccount = await requestInfoAccounts(
        id,
        sessionStorage.getItem('token')
      );
      const infoHistoryAccountView = infoHistoryAccountCreate(
        requestNumberAccount.payload.account,
        requestNumberAccount.payload.balance,
        requestNumberAccount.payload.transactions
      );
      const headerViewAfterAuthorization = headerViewAfterLoginCreate();
      setChildren(header, headerViewAfterAuthorization.headerContainer);
      setChildren(main, infoHistoryAccountView);
      headerViewAfterAuthorization.linkAccounts.classList.add(
        'header__item--active'
      );
    } catch (error) {
      console.log(error);
      nIntervId = setInterval(timer, 1500);
    }
  })
  .on('/atm', () => {
    try {
      const atmMap = createAtmInfo();
      const headerViewAfterAuthorization = headerViewAfterLoginCreate();
      setChildren(header, headerViewAfterAuthorization.headerContainer);
      setChildren(main, atmMap);
      headerViewAfterAuthorization.linkAtm.classList.add(
        'header__item--active'
      );
    } catch (error) {
      console.log(error);
      nIntervId = setInterval(timer, 1500);
    }
  })
  .on('/currency', async () => {
    headerSk();
    setChildren(main, currencySkeleton());
    try {
      const currencyView = await createCurrencyExchange();
      const headerViewAfterAuthorization = headerViewAfterLoginCreate();
      setChildren(header, headerViewAfterAuthorization.headerContainer);
      setChildren(main, currencyView);
      headerViewAfterAuthorization.linkCurrency.classList.add(
        'header__item--active'
      );
    } catch (error) {
      console.log(error);
      nIntervId = setInterval(timer, 1500);
    }
  })
  .resolve();
