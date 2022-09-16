import { el, setChildren } from 'redom';
import { validationPassword } from './validation';
import { authorization } from './requests';
import { errorView } from './modals';
// eslint-disable-next-line import/no-cycle
import router from '../main';
import '../styles.scss';
import '../media.scss';

// вход
async function enterToAccounts(login, password, labelLogin, labelPassword) {
  const validPassword = validationPassword(password);
  if (validPassword) {
    const response = await authorization(login, password);
    if (response.error === '') {
      sessionStorage.setItem('token', response.payload.token);
      router.navigate('/accounts');
    } else {
      const errLog = errorView('Проверьте логин и попробуйте developer');
      const errPas = errorView('Проверьте пароль и попробуйте skillbox');
      labelLogin.append(errLog);
      labelPassword.append(errPas);
    }
  }
}
// отрисовка формы входа
export default function loginViewCreate() {
  const section = el('section.login.container');
  const loginContainer = el('div.login__container');
  const loginTitle = el('h2.login__title', 'Вход в аккаунт');
  const loginForm = el('form.login__form');
  const loginSubjectLog = el('span.login__subject', 'Логин');
  const loginSubjectPas = el(
    'span.login__subject.login__subject--margin-password',
    'Пароль'
  );
  const loginLabelLog = el('label.login__label');
  const loginLabelPas = el('label.login__label');
  const loginInputLog = el('input.login__input', {
    placeholder: 'Введите логин',
  });
  const loginInputPas = el('input.login__input', {
    placeholder: 'Введите пароль',
    type: 'password',
  });
  const loginButton = el('button.login__button.btn', 'Войти');

  setChildren(loginLabelLog, [loginSubjectLog, loginInputLog]);
  setChildren(loginLabelPas, [loginSubjectPas, loginInputPas]);
  setChildren(loginForm, [loginLabelLog, loginLabelPas, loginButton]);
  setChildren(loginContainer, [loginTitle, loginForm]);
  setChildren(section, loginContainer);

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    enterToAccounts(
      loginInputLog.value,
      loginInputPas.value,
      loginLabelLog,
      loginLabelPas
    );
  });

  return {
    section,
    loginForm,
    loginInputLog,
    loginInputPas,
    loginLabelLog,
    loginLabelPas,
  };
}
