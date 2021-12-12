import chalk from "chalk";

const log = (...args) => console.log(...args, "\n");

const red = (...args) => log(chalk.red.bold(...args));
const blue = (...args) => log(chalk.blue.bold(...args));
const yellow = (...args) => log(chalk.yellow(...args));
const green = (...args) => log(chalk.green(...args));

export { red, blue, yellow, green };
