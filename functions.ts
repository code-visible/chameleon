export class Function {
  name: string;
  params: string[];
  results: string[];
  pos: string;
  comment: string;
  method: boolean;
  private: boolean;

  constructor(name: string) {
    this.name = name;
    this.params = [];
    this.results = [];
    this.pos = "";
    this.comment = "";
    this.method = false;
    this.private = false;
  }
};

export class Call {
  name: string;
  pos: string;
  typ: string;
  signature: string;

  constructor(name: string) {
    this.name = name;
    this.pos = "";
    this.typ = "";
    this.signature = "";
  }
};

