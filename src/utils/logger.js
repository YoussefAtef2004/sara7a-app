import chalk from 'chalk';


class Logger {
  
  static getTimestamp() {
    return new Date().toISOString();
  }

 
  static info(message, ...args) {
    console.log(
      chalk.blue(`[${this.getTimestamp()}] [INFO]`),
      message,
      ...args
    );
  }

  
  static success(message, ...args) {
    console.log(
      chalk.green(`[${this.getTimestamp()}] [SUCCESS]`),
      message,
      ...args
    );
  }

  
  static warn(message, ...args) {
    console.warn(
      chalk.yellow(`[${this.getTimestamp()}] [WARN]`),
      message,
      ...args
    );
  }

  
  static error(message, ...args) {
    console.error(
      chalk.red(`[${this.getTimestamp()}] [ERROR]`),
      message,
      ...args
    );
  }

  
  static debug(message, ...args) {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        chalk.gray(`[${this.getTimestamp()}] [DEBUG]`),
        message,
        ...args
      );
    }
  }

  
  static fatal(message, ...args) {
    console.error(
      chalk.red.bold(`[${this.getTimestamp()}] [FATAL]`),
      message,
      ...args
    );
  }
}

export default Logger;
