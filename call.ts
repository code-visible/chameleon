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
  file: string;
  method: boolean;
  private: boolean;

  constructor(name: string) {
    this.name = name;
    this.params = [];
    this.results = [];
    this.pos = "";
    this.comment = "";
    this.file = "";
    this.method = false;
    this.private = false;
  }
};
