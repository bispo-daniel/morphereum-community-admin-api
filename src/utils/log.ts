import chalk from 'chalk';

const defaultLog = console.log;
const defaultWarn = console.warn;
const defaultError = console.error;

const log = (...args: any[]) => {
  const date = new Date().toLocaleString();
  defaultLog(chalk.dim(`[${date}]`), ...args);
};
const warn = (...args: any[]) => {
  const date = new Date().toLocaleString();
  defaultWarn(chalk.yellow(`[${date}]`), ...args);
};
const error = (...args: any[]) => {
  const date = new Date().toLocaleString();
  defaultError(chalk.red(`[${date}]`), ...args);
};

console.log = log;
console.warn = warn;
console.error = error;
