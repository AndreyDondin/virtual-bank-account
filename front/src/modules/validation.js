import binking from 'binking';

export function validationCardNumber(value) {
  const result =
    value.length > 18 ? undefined : binking.validateCardNumber(value);
  return result;
}

export function validationPassword(pass) {
  return !!(pass.length >= 6 && /^\S*$/.test(pass));
}

export function validationAmount(amount, balance) {
  let value = null;
  if (amount > 0 && balance > amount) {
    value = amount;
  }
  if (amount < 0 || amount === '') {
    value = -1;
  }
  if (amount > balance) {
    value = null;
  }
  return value;
}
