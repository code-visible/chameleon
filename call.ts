import * as callable from "./protocol/callable";

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
  id: string;
  name: string;
  params: string[];
  results: string[];
  pos: string;
  comment: string;
  dir: string;
  file: string;
  method: boolean;
  private: boolean;
  abstract: string;

  constructor(name: string, abstract?: string) {
    this.id = "";
    this.name = name;
    this.params = [];
    this.results = [];
    this.pos = "";
    this.comment = "";
    this.file = "";
    this.dir = "";
    this.method = abstract ? true : false;
    this.private = false;
    this.abstract = abstract || "";
  }

  dump(): callable.SourceCallable {
    const result: callable.SourceCallable = {
      id: this.id,
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
