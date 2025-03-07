import path from "path";
import { Project } from "./sourcemap";

const p = new Project("depict", "testdata/depict", ".");
const distDir = "dist";

p.walk();
p.parseAllFiles();
const d = p.dump();

await Bun.write(path.join(distDir, `${p.name}.json`), JSON.stringify(d));