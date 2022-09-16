import { el, setChildren } from 'redom';
// показ ошибки/подсказки в логине
export function errorView(message) {
  const error = el('span.login__tooltip-text', message);
  return error;
}
export function modalCreate(message, title) {
  const modalWrap = el('div.modal');
  const container = el('div.modal__container');
  const errorTitle = el('h3.modal__title', title);
  const errorMessage = el('p.modal__message', message);
  const button = el('button.modal__btn.btn', 'ОК');

  function removeModal(e) {
    if (container.contains(e.target)) return;
    modalWrap.remove();
    document.body.removeEventListener('click', removeModal);
  }

  document.body.addEventListener('click', removeModal);

  setChildren(container, [errorTitle, errorMessage, button]);
  setChildren(modalWrap, container);
  document.body.append(modalWrap);

  button.addEventListener('click', () => {
    modalWrap.remove();
    document.body.removeEventListener('click', removeModal);
  });

  return modalWrap;
}
