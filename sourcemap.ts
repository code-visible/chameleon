import { readdirSync, statSync } from "fs";
import { Dir, File, Dep } from "./sourcecode";
import { join } from "path";
import { chdir } from "process";

export class Project {
  name: string;
  path: string;
  directory: string;
  dirs: Map<string, Dir>;
  files: Map<string, File>;
  deps: Map<string, Dep>;

  constructor(name: string, path: string, directory: string) {
    this.name = name;
    this.path = path;
    this.directory = directory;
    this.dirs = new Map();
    this.files = new Map();
    this.deps = new Map();
  }

  walk() {
    // if errors happen, exit the process immediately
    chdir(this.path);
    this.walkDirectory(this.directory);
  }

  // walk the given directory
  // find all the directories and files
  walkDirectory(dir: string) {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stats = statSync(fullPath);

      if (stats.isDirectory()) {
        // handle directories
        this.dirs.set(fullPath, new Dir(fullPath));
        this.walkDirectory(fullPath);
      } else {
        // handle files
        const f = new File(fullPath, this.lookupDep.bind(this));
        this.files.set(fullPath, f);
        this.deps.set(fullPath, new Dep(f));
      }
    }
  }

  // to parse all the files
  parseAllFiles() {
    for (const file of this.files.values()) {
      if (file.ts || file.js) file.parse();
    }
  }

  lookupDir(name: string): Dir | undefined {
    return this.dirs.get(name);
  }

  lookupFile(name: string): File | undefined {
    return undefined;
  }

  lookupDep(name: string): Dep | undefined {
    const tsName = `${name}.ts`;
    const jsName = `${name}.js`;
    if (this.deps.has(tsName)) return this.deps.get(tsName);
    if (this.deps.has(jsName)) return this.deps.get(jsName);
    return undefined;
  }
};