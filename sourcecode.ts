import { createSourceFile, forEachChild, ScriptTarget, SyntaxKind, type Node, type SourceFile } from "typescript";
import { Parser } from "./parser";
import { readFileSync } from "fs";
import { basename, dirname } from "path";
import * as file from "./protocol/file";
import * as dep from "./protocol/dep";
import * as pkg from "./protocol/pkg";
import { caculateHashID } from "./utils";

export type LookupDepFn = (name: string) => Dep | undefined;

export type LookupDirFn = (name: string) => Dir | undefined;

export class Dep {
  id: string;
  name: string;
  typ: string;
  ref: File;

  constructor(file: File) {
    this.id = "";
    this.name = file.name;
    this.typ = "file";
    this.ref = file;
    this.id = caculateHashID(`dep-${this.name}`);
  }

  dump(): dep.SourceDep {
    const result: dep.SourceDep = {
      id: this.id,
      name: this.name,
      type: this.typ,
      ref: "",
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
    this.source = undefined;
    this.deps = new Map();
    this.lookupDep = lookupDep;
    this.lookupDir = lookupDir;
    // this.dirPtr = lookupDir();
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
      path: this.path,
      pkg: "",
      deps: [],
    };
    return result;
  }
};