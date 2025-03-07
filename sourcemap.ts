import { readdirSync, statSync } from "fs";
import { Dir, File, Dep } from "./sourcecode";
import { join } from "path";
import { chdir } from "process";
import type { Source } from "./protocol/map";

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
    const projectPath = statSync(this.directory);
    if (!projectPath.isDirectory()) return;
    this.dirs.set(this.directory, new Dir(this.directory));
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
        const f = new File(fullPath, this.lookupDir.bind(this), this.lookupDep.bind(this));
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

  dump(): Source {
    const result: Source = {
      name: this.name,
      lang: "Javascript",
      repository: "",
      version: "",
      pkgs: [],
      files: [],
      abstracts: [],
      callables: [],
      calls: [],
      deps: [],
    };
    for (const d of this.dirs.values()) {
      result.pkgs.push(d.dump());
    }
    for (const f of this.files.values()) {
      if (f.ts || f.js || f.json) {
        const fileDump = f.dump();
        result.files.push(fileDump);
        if (f.ts || f.js) {
          for (const fn of f.fns.values()) {
            result.callables.push(fn.dump());
          }
        }
      }
    }
    for (const d of this.deps.values()) {
      result.deps.push(d.dump());
    }

    return result;
  }
};