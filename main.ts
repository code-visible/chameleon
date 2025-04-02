import { join } from "node:path";
import { cwd } from "node:process";
import { parseConfig } from "./config";
import logger from "./logger";
import { Project } from "./sourcemap";

const conf = parseConfig();

logger.info(
    `chameleon: parsing project (${conf.project}) with directory (${conf.directory}).`,
);

const execPath = cwd();

const p = new Project(conf.name, conf.project, conf.directory, conf.excludes);

await p.scanRepository();
p.parseAllFiles();

const d = p.dump();
const dumpPath = join(execPath, conf.dumpPath);
await Bun.write(dumpPath, JSON.stringify(d));

logger.info(
    `chameleon: parsing project successfully, dump to ${conf.dumpPath}`,
);
