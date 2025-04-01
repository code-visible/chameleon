export class Reference {
    name: string;
    pos: string;
    file: string;

    constructor(name: string) {
        this.name = name;
        this.pos = "";
        this.file = "";
    }
}

export class Abstract {
    name: string;
    fields: string[];
    pos: string;
    file: string;
    comment: string;

    constructor(name: string) {
        this.name = name;
        this.fields = [];
        this.pos = "";
        this.file = "";
        this.comment = "";
    }
}
