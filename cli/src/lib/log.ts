import chalk from 'chalk';

// tslint:disable:no-console
const log = (...args: any[]) => console.log(...args, '\n');

const red = (...args: any[]) => log(chalk.red.bold(...args));
const blue = (...args: any[]) => log(chalk.blue.bold(...args));
const yellow = (...args: any[]) => log(chalk.yellow(...args));
const green = (...args: any[]) => log(chalk.green(...args));

export { red, blue, yellow, green };
