import { createSourceFile, forEachChild, ScriptTarget, SyntaxKind, type Node, type SourceFile } from "typescript";
import { Parser } from "./parser";
import { readFileSync } from "fs";
import { basename, dirname } from "path";
// import * as file from "./protocol/file";

export type LookupDepFn = (name: string) => Dep | undefined;

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
  }
};

export class Dir {
  path: string;
  files: number;
  pkg: boolean;

  constructor(path: string) {
    this.path = path;
    this.files = 0;
    this.pkg = false;
  }
};

export class File {
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

  private source?: SourceFile;

  constructor(path: string, lookupDep: LookupDepFn) {
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
  // TODO: dump
  // dump(): file.SourceFile {}
};