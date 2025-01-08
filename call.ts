import * as callable from "./protocol/callable";
import { caculateHashID } from "./utils";

export class Call {
  name: string;
  pos: string;
  typ: string;
  signature: string;
  file: string;

  constructor(name: string) {
    this.name = name;
    this.pos = "";
    this.typ = "";
    this.signature = "";
    this.file = "";
  }
};

export class Function {
  name: string;
  params: string[];
  results: string[];
  pos: string;
  comment: string;
  dir: string;
  file: string;
  fileIdent: string;
  method: boolean;
  private: boolean;
  abstract: string;

  constructor(name: string, abstract?: string) {
    this.name = name;
    this.params = [];
    this.results = [];
    this.pos = "";
    this.comment = "";
    this.file = "";
    this.fileIdent = "";
    this.dir = "";
    this.method = abstract ? true : false;
    this.private = false;
    this.abstract = abstract || "";
  }

  getID(): string {
    if (this.method) return caculateHashID(`${this.fileIdent}:${this.abstract}.${this.name}`)
    return caculateHashID(`${this.fileIdent}:${this.name}`);
  }

  dump(): callable.SourceCallable {
    const result: callable.SourceCallable = {
      id: this.getID(),
      pos: "",
      name: this.name,
      signature: "",
      abstract: this.abstract,
      file: this.file,
      pkg: this.dir,
      comment: "",
      parameters: [],
      results: [],
      method: this.method,
      private: false,
      orphan: false,
      // pkg: this.dirPtr ? this.dirPtr.id : "",
      // deps: [],
    };
    // for (const dep of this.deps.values()) {
    //   result.deps.push(dep.id);
    // }
    return result;
  }
};
