import { forEachChild, type Node, type SourceFile } from "typescript";
// import * as file from "./protocol/file";

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
  test: boolean;
  error: string;

  constructor(path: string, name: string, dir: Dir) {
    this.path = "";
    this.name = "";
    this.dir = "";
    this.ts = false;
    this.js = false;
    this.test = false;
    this.error = "";
  }

  parse(sourceFile: SourceFile) {
    this.traverse(sourceFile);
  }

  traverse(node: Node) {
    forEachChild(node, this.traverse.bind(this));
  }

  // TODO: dump
  // dump(): file.SourceFile {}
};