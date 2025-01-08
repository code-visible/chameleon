import { createSourceFile, ScriptTarget, type SourceFile } from "typescript";
import { Parser } from "./parser";
import { readFileSync } from "fs";
import { basename, dirname } from "path";
import { caculateHashID } from "./utils";
import * as file from "./protocol/file";
import * as dep from "./protocol/dep";
import * as pkg from "./protocol/pkg";
import type { Call, Function } from "./call";
import type { Abstract } from "./definition";

export type LookupDepFn = (name: string) => Dep | undefined;

export type LookupDirFn = (name: string) => Dir | undefined;

export class Dep {
  id: string;
  name: string;
  typ: string;
  filePtr: File;

  constructor(file: File) {
    this.id = caculateHashID(`dep-${file.name}`);
    this.name = file.name;
    this.typ = "file";
    this.filePtr = file;
  }

  dump(): dep.SourceDep {
    const result: dep.SourceDep = {
      id: this.id,
      name: this.name,
      type: this.typ,
      ref: this.filePtr ? this.filePtr.id : "",
    };
    return result;
  }
};

export class Dir {
  id: string;
  path: string;
  files: number;
  pkg: boolean;

  constructor(path: string) {
    this.path = path;
    this.files = 0;
    this.pkg = false;
    this.id = caculateHashID(path);
  }

  dump(): pkg.SourcePkg {
    const result: pkg.SourcePkg = {
      id: this.id,
      name: "",
      path: this.path,
    };
    return result;
  }
};

export class File {
  id: string;
  path: string;
  name: string;
  dir: string;
  ts: boolean;
  js: boolean;
  json: boolean;
  test: boolean;
  error: string;
  fns: Map<string, Function>;
  abs: Map<string, Abstract>;
  calls: Call[];
  deps: Map<string, Dep>;
  lookupDep: LookupDepFn;
  lookupDir: LookupDirFn;
  dirPtr?: Dir;

  private source?: SourceFile;

  constructor(path: string, lookupDir: LookupDirFn, lookupDep: LookupDepFn) {
    this.path = path;
    this.name = basename(path);
    this.dir = dirname(path);
    this.ts = false;
    this.js = false;
    this.json = false;
    this.test = false;
    this.error = "";
    this.fns = new Map();
    this.abs = new Map();
    this.calls = [];
    this.source = undefined;
    this.deps = new Map();
    this.lookupDep = lookupDep;
    this.lookupDir = lookupDir;
    this.dirPtr = lookupDir(this.dir);
    this.id = caculateHashID(path);
    if (this.name.endsWith(".ts")) {
      this.ts = true;
    } else if (this.name.endsWith(".js")) {
      this.js = true;
    } else if (this.name.endsWith(".json")) {
      this.json = true;
    }
  }

  parse() {
    const sourceData = this.loadFromDisk();
    this.source = createSourceFile(this.path, sourceData, ScriptTarget.ES2015);
    const parser = new Parser(this.dir, this.source);
    parser.parseSource();
    for (const name of parser.imports) {
      const dep = this.lookupDep(name);
      if (dep) this.deps.set(name, dep);
    }
    this.fns = parser.fns;
    for (const fn of parser.fns.values()) {
      fn.file = this.id;
      if (this.dirPtr) {
        fn.dir = this.dirPtr.id;
      }
    }
  }

  private loadFromDisk(): string {
    return readFileSync(this.path).toString();
  }

  isSource(): boolean {
    return this.ts || this.js;
  }

  dump(): file.SourceFile {
    const result: file.SourceFile = {
      id: this.id,
      name: this.name,
      path: this.dir,
      pkg: this.dirPtr ? this.dirPtr.id : "",
      deps: [],
    };
    for (const dep of this.deps.values()) {
      result.deps.push(dep.id);
    }
    return result;
  }
};