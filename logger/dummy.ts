import { Logger } from "./logger";

export class DummyLogger extends Logger {
  debug(msg: string): void {
    console.log(`debug: ${msg}`);
  }

  warn(msg: string) {
    console.log(msg);
  }

  info(msg: string) {
    console.log(msg);
  }

  error(msg: string) {
    console.log(msg);
  }
}