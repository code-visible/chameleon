import { Logger } from "./logger";

export class DummyLogger extends Logger {
    debug(msg: string): void {
        console.log(`[debug] ${msg}`);
    }

    warn(msg: string) {
        console.log(`[warn] ${msg}`);
    }

    info(msg: string) {
        console.log(`[info] ${msg}`);
    }

    error(msg: string) {
        console.log(`[error] ${msg}`);
    }
}
