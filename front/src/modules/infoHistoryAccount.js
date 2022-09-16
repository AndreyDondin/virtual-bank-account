/* eslint-disable import/no-cycle */
import { el, setChildren, mount } from 'redom';
import Highcharts from 'highcharts';
import Exporting from 'highcharts/modules/exporting';
import {
  headInfoAccountCreate,
  diagrammInfoAccountCreate,
  getMapForDiagram,
  historyInfoAccountCreate,
  sliceIntoChunks,
} from './infoAccount';
import '../styles.scss';
import '../media.scss';

Exporting(Highcharts);

// диаграмма с соотношением доходов/расходов
export function correlationAmountDiagram(transactions, month, number, width) {
  const containerBottomDiagram = el('div.info__block-right');
  const titleBottomDiagram = el(
    'h3.info__block-title',
    'Соотношение входящих исходящих транзакций'
  );

  const diagramBlock = el('div.info__diagram-container');
  const diagramContainer = el('div.info__diagram');
  const max = el('span.info__diagramm-text');
  const min = el('span.info__diagramm-text');
  const blockMinMax = el('div.info__diagram-info-wrap');

  const map = getMapForDiagram(transactions, month, number);

  Highcharts.chart(diagramContainer, {
    chart: {
      renderTo: 'chart',
      type: 'column',
      width,
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
        stacking: 'normal',
      },
    },
    series: [
      {
        name: 'debit',
        data: Array.from(map.mapProfit.values()),
        color: '#76CA66',
        stack: 'month',
      },
      {
        name: 'credit',
        data: Array.from(map.mapCosts.values()),
        color: '#FD4E5D',
        stack: 'month',
      },
    ],
  });

  max.textContent = Math.max(...Array.from(map.mapAmount.values()));
  min.textContent = Math.min(...Array.from(map.mapAmount.values()));

  setChildren(blockMinMax, [max, min]);
  setChildren(diagramBlock, [diagramContainer, blockMinMax]);

  setChildren(containerBottomDiagram, [titleBottomDiagram, diagramBlock]);

  return containerBottomDiagram;
}

// перерисовка таблицы при использовании пагинации
function replaceTabel(transactions, e, number, container) {
  localStorage.clear();
  localStorage.setItem(e, 'active');
  sliceIntoChunks(transactions, 25);
  const historyTransactionsInfoHistory = historyInfoAccountCreate(
    transactions,
    number,
    25,
    e,
    false
  );
  mount(
    document.querySelector('.history'),
    historyTransactionsInfoHistory,
    document.querySelector('.info__table-container'),
    true
  );

  setChildren(
    container,
    // eslint-disable-next-line no-use-before-define
    paginationCreate(transactions, e, number)
  );
}

// создание ссылки пагинации
function createLinkForPagination(container, text, transactions, number) {
  const paginationItem = el('li.history__pagination-item', text);

  if (localStorage.getItem(text)) {
    paginationItem.classList.add('history__pagination-item--active');
  }
  paginationItem.addEventListener('click', (e) => {
    const page = Number(e.target.textContent);
    replaceTabel(transactions, page, number, container);
  });

  container.append(paginationItem);
  return paginationItem;
}

// создание пагинации
function paginationCreate(transactions, active, number) {
  const container = el('ul.history__pagination-list.list-reset');
  const prev = el('li.history__pagination-item', 'Предыдущая');
  const next = el('li.history__pagination-item', 'Следующая');

  const numberButtons = Math.ceil(transactions.length / 25);
  const activeP = +active;
  localStorage.clear();
  localStorage.setItem(activeP, 'active');
  prev.addEventListener('click', () => {
    if (activeP > 1) {
      replaceTabel(transactions, activeP - 1, activeP, container);
    }
  });
  if (numberButtons > 3) {
    if (activeP < 3) {
      createLinkForPagination(container, 1, transactions, number);
      createLinkForPagination(container, 2, transactions, number);
      createLinkForPagination(container, 3, transactions, number);
      createLinkForPagination(container, numberButtons, transactions, number);
    }
    if (activeP >= 3 && activeP < numberButtons) {
      createLinkForPagination(container, 1, transactions, number);
      createLinkForPagination(container, activeP - 1, transactions, number);
      createLinkForPagination(container, activeP, transactions, number);
      createLinkForPagination(container, activeP + 1, transactions, number);
      createLinkForPagination(container, numberButtons, transactions, number);
    }
    if (activeP === numberButtons) {
      createLinkForPagination(container, 1, transactions, number);
      createLinkForPagination(container, activeP - 3, transactions, number);
      createLinkForPagination(container, activeP - 2, transactions, number);
      createLinkForPagination(container, activeP - 1, transactions, number);
      createLinkForPagination(container, activeP, transactions, number);
    }
  } else if (numberButtons > 2) {
    if (activeP <= 3) {
      createLinkForPagination(container, 1, transactions, number);
      createLinkForPagination(container, 2, transactions, number);
      createLinkForPagination(container, 3, transactions, number);
    }
  } else if (numberButtons > 1) {
    createLinkForPagination(container, 1, transactions, number);
    createLinkForPagination(container, 2, transactions, number);
  }

  next.addEventListener('click', () => {
    if (activeP < numberButtons) {
      replaceTabel(transactions, activeP + 1, activeP, container);
    }
  });

  container.append(next);
  container.prepend(prev);

  return container;
}

// отрисовка секции подробной информации истории счета
export function infoHistoryAccountCreate(number, balance, transactions) {
  if (!sessionStorage.getItem('token')) {
    throw new Error('Вы не авторизованы');
  }

  const container = el('div.history');
  const hrefBack = window.location.pathname.slice(0, -5);
  const headInfoHistory = headInfoAccountCreate(
    number,
    balance,
    hrefBack,
    'История баланса'
  );
  // ширина экрана за минусом отступов для диаграммы
  const width = document.documentElement.clientWidth - 330;
  const diagramInfoHistory = diagrammInfoAccountCreate(
    transactions,
    number,
    12,
    width,
    false
  );
  const bottomDiagramInfoHistory = correlationAmountDiagram(
    transactions,
    12,
    number,
    width
  );

  const historyTransactionsInfoHistory = historyInfoAccountCreate(
    transactions,
    number,
    25,
    1,
    false
  );
  setChildren(
    container,
    headInfoHistory,
    diagramInfoHistory,
    bottomDiagramInfoHistory,
    historyTransactionsInfoHistory
  );

  if (transactions.length > 25) {
    const paginationInfoHistory = paginationCreate(transactions, 1, number);
    container.append(paginationInfoHistory);
  }

  return container;
}

// скелетон
export function infoHistorySkeleton() {
  const section = el('section.skeleton__section');
  const title = el('h2.skeleton__header');
  const text = el('h2.skeleton__header');
  const wrap = el('div.skeleton__container-col');
  const text2 = el('h2.skeleton__header');
  const btnCreateAcc = el('button.skeleton__btn.btn');
  const wrap2 = el('div.skeleton__container-col');
  const container = el('div.skeleton__up-container');

  const div1 = el('div.skeleton__table');
  const div2 = el('div.skeleton__table');
  const table = el('div.skeleton__table');

  setChildren(wrap, [title, text]);
  setChildren(wrap2, [text2, btnCreateAcc]);
  setChildren(container, [wrap, wrap2]);

  setChildren(section, [container, div1, div2, table]);

  return section;
}
