/* eslint-disable jest/expect-expect */
describe('Авторизация', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080');
    cy.get('input').eq(0).type('developer');
    cy.get('input').eq(1).type('skillbox');
    cy.get('button').click();
  });

  it('Просмотр счетов', () => {
    cy.get('.accounts__card').should('be.visible');
  });

  it('Создать счет', () => {
    cy.get('.accounts__btn').click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get('.accounts__card').then((card) => {
      cy.get('.accounts__card')
        .eq(card.length - 1)
        .get('.accounts__card-sub')
        .eq(card.length - 1)
        .should('have.text', '0 ₽');
    });
  });
  it('Перевести средства и если в модальном окне все хорошо,то средства переведены', () => {
    cy.get('.accounts__card-btn').eq(1).click();
    cy.get('input').eq(0).type('5585360030210272');
    cy.get('input').eq(1).type('500');
    cy.get('.info__block-btn').click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get('.modal__title').should('have.text', 'Все хорошо');
  });
});
