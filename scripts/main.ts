// DOM elements
const elResult = <HTMLInputElement>document.getElementById('result');
const elUppercase = <HTMLInputElement>document.getElementById('uppercase');
const elLowercase = <HTMLInputElement>document.getElementById('lowercase');
const elNumber = <HTMLInputElement>document.getElementById('number');
const elSymbol = <HTMLInputElement>document.getElementById('symbol');
const elLength = <HTMLInputElement>document.getElementById('length');
const btnGenerate = <HTMLButtonElement>document.getElementById('generate');
const btnClipboard = <HTMLButtonElement>document.getElementById('clipboard');

interface generateOptions {
  upper: boolean;
  lower: boolean;
  number: boolean;
  symbol: boolean;
}
function GeneratePassword(length: number, options: generateOptions): string {
  // Ramdon functions
  function getRamdonInt(max: number, move: number = 0): number {
    return Math.floor(Math.random() * Math.floor(max)) + move;
  }
  // Generator functions
  function getRandomUpper(): string {
    const charCode: number = getRamdonInt(26, 65);
    return String.fromCharCode(charCode);
  }
  function getRandomLower(): string {
    const charCode: number = getRamdonInt(26, 97);
    return String.fromCharCode(charCode);
  }
  function getRandomNumber(): string {
    const charCode: number = getRamdonInt(10, 48);
    return String.fromCharCode(charCode);
  }
  function getRandomSymbol(): string {
    const charCode: number = getRamdonInt(14, 33);
    return String.fromCharCode(charCode);
  }

  const { upper, lower, number, symbol } = options;
  const generation = [];
  let password = '';
  if (upper) {
    generation.push(getRandomUpper);
  }
  if (lower) {
    generation.push(getRandomLower);
  }
  if (number) {
    generation.push(getRandomNumber);
  }
  if (symbol) {
    generation.push(getRandomSymbol);
  }

  for (let i = 0; i < length; i += 1) {
    const randomInt = getRamdonInt(generation.length);
    password += generation[randomInt]();
  }

  return password;
}

btnGenerate.addEventListener('click', () => {
  const length: number = parseInt(elLength.value);
  const options: generateOptions = {
    upper: elUppercase.checked,
    lower: elLowercase.checked,
    number: elNumber.checked,
    symbol: elSymbol.checked,
  };
  elResult.value = GeneratePassword(length, options);
});

btnClipboard.addEventListener('click', () => {
  elResult.select();
  document.execCommand('copy', false);
  btnClipboard.focus();
});
