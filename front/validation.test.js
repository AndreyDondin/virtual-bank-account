import {
  validationCardNumber,
  validationPassword,
  validationAmount,
} from './src/modules/validation';

// валидация пароля
test('Валидация пароля не пропускает пробелы', () => {
  const result = validationPassword('4565 4568');
  expect(result).toBeFalsy();
});

test('Валидация пароля не пропускает значения меньше 6 символов', () => {
  const result = validationPassword('4441');
  expect(result).toBeFalsy();
});

test('Валидация пароля пропускает значения больше 6 и без пробела', () => {
  const result = validationPassword('dssErf345');
  expect(result).toBeTruthy();
});

// валидация номера карты или счета
test('Валидация номера карты пропускает корректный номер карты', () => {
  const result = validationCardNumber('4000793474221902');
  expect(result).toBeUndefined();
});

test('Валидация номера карты не пропускает произвольную строку, содержащую любые нецифровые символы', () => {
  const result = validationCardNumber('4Ф00aT742219?02');
  expect(result).toBeDefined();
});

test('Валидация номера карты не пропускает строку с недостаточным количеством цифр', () => {
  const result = validationCardNumber('40007934742219');
  expect(result).toBeDefined();
});

test('Валидация номера карты пропускает строку со слишком большим количеством цифр,считая,что это номер счета', () => {
  const result = validationCardNumber('400079347422190222877143');
  expect(result).toBeUndefined();
});

// валидация возможности провести транзакцию
test('Валидация транзакции пропускает если сумма больше нуля и сумма меньше баланса', () => {
  const result = validationAmount(500, 1000);
  expect(result).toBe(500);
});

test('Валидация транзакции не пропускает если сумма отрицательная или пустая строка', () => {
  const result = validationAmount(-10, 100);
  expect(result).toBe(-1);
});

test('Валидация транзакции не пропускает если сумма больше баланса', () => {
  const result = validationAmount(500, 100);
  expect(result).toBeNull();
});
