// запрос user
async function enter(user) {
  const request = await fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  });
  const response = await request.json();
  return response;
}
// авторизация
export async function authorization(log, pass) {
  document.querySelectorAll('.login__tooltip-text').forEach((e) => {
    e.remove();
  });
  const user = {
    login: log,
    password: pass,
  };

  const response = await enter(user);
  return response;
}
// запрос счетов
export async function requestAccounts(href, token) {
  const request = await fetch(`http://localhost:3000/${href}`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${token}`,
    },
  });
  const response = await request.json();
  return response;
}
// создание счета
export async function createNewAccount(token) {
  const request = await fetch('http://localhost:3000/create-account', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${token}`,
    },
  });
  const response = await request.json();
  return response;
}
// запрос подробной информации о счете
export async function requestInfoAccounts(href, token) {
  const request = await fetch(`http://localhost:3000/account/${href}`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${token}`,
    },
  });
  const response = await request.json();
  return response;
}
// перевод средств в рублях
export async function transferMoney(token, data) {
  const request = await fetch('http://localhost:3000/transfer-funds', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  const response = await request.json();
  return response;
}
// получение точек банкоматов
export async function requestAtm(token) {
  const request = await fetch('http://localhost:3000/banks', {
    method: 'GET',
    headers: {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const response = await request.json();
  return response;
}
// получение своих валют
export async function requestMyCurrencies(token) {
  const request = await fetch('http://localhost:3000/currencies', {
    method: 'GET',
    headers: {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const response = await request.json();
  return response;
}
// получение списка валют
export async function requestCurrencies(token) {
  const request = await fetch('http://localhost:3000/all-currencies', {
    method: 'GET',
    headers: {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const response = await request.json();
  return response;
}
// перевод валюты
export async function transferCurrency(token, data) {
  const request = await fetch('http://localhost:3000/currency-buy', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  const response = await request.json();
  return response;
}
