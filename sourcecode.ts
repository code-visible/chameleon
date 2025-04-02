import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { createSourceFile, ScriptTarget, type SourceFile } from "typescript";
import type { Call, Callable } from "./call";
import type { Abstract } from "./definition";
import { Parser } from "./parser";
import type * as dep from "./protocol/dep";
import type * as file from "./protocol/file";
import type * as pkg from "./protocol/pkg";
import { caculateHashID, getNameFromPath, normalizePath } from "./utils";

export type LookupDepFn = (name: string) => Dep | undefined;

// export type LookupDirFn = (name: string) => Dir | undefined;

export class Dep {
    ident: string;
    name: string;
    typ: string;
    filePtr: File;

    constructor(file: File) {
        this.ident = `dep-${file.name}`;
        this.name = file.name;
        this.typ = "file";
        this.filePtr = file;
    }

    getID(): string {
        return caculateHashID(this.ident);
    }

    dump(): dep.SourceDep {
        const result: dep.SourceDep = {
            id: this.getID(),
            name: this.name,
            type: this.typ,
            ref: this.filePtr ? this.filePtr.getID() : "",
        };
        return result;
    }
}

export class Dir {
    ident: string;
    path: string;
    files: number;
    pkg: boolean;
    imps: Map<string, Dir>;

    constructor(path: string) {
        this.path = path;
        this.files = 0;
        this.pkg = false;
        this.ident = path;
        this.imps = new Map();
    }

    getID(): string {
        return caculateHashID(this.ident);
    }

    dump(): pkg.SourcePkg {
        const dumpPath = normalizePath(this.path);
        const result: pkg.SourcePkg = {
            id: this.getID(),
            name: getNameFromPath(dumpPath),
            fullName: dumpPath,
            path: dumpPath,
            imports: [],
        };
        for (const i of this.imps.values()) {
            result.imports.push(i.getID());
        }
        return result;
    }
}

export class File {
    ident: string;
    path: string;
    name: string;
    dir: Dir;
    ts: boolean;
    js: boolean;
    json: boolean;
    test: boolean;
    error: string;
    fns: Map<string, Callable>;
    abs: Map<string, Abstract>;
    imps: Map<string, File>;
    calls: Call[];
    deps: Map<string, Dep>;
    lookupDep: LookupDepFn;

    private source?: SourceFile;

    constructor(path: string, dir: Dir, lookupDep: LookupDepFn) {
        this.ident = path;
        this.path = path;
        this.name = basename(path);
        this.dir = dir;
        this.ts = false;
        this.js = false;
        this.json = false;
        this.test = false;
        this.error = "";
        this.fns = new Map();
        this.abs = new Map();
        this.imps = new Map();
        this.calls = [];
        this.source = undefined;
        this.lookupDep = lookupDep;
        this.deps = new Map();
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
        this.source = createSourceFile(
            this.path,
            sourceData,
            ScriptTarget.ES2015,
        );
        const parser = new Parser(this.dir.path, this.source);
        parser.parseSource();
        for (const name of parser.imports) {
            const dep = this.lookupDep(name);
            if (dep) this.deps.set(name, dep);
        }
        this.fns = parser.fns;
        for (const fn of parser.fns.values()) {
            this.completeFunction(fn);
        }

        for (const dep of this.deps.values()) {
            this.connectDependencies(dep);
        }
    }

    connectDependencies(dep: Dep) {
        if (dep.typ === "file") {
            const target = dep.filePtr;
            this.imps.set(target.ident, target);
            const srcDir = this.dir;
            const targetDir = target.dir;
            if (srcDir && targetDir && srcDir !== targetDir) {
                srcDir.imps.set(targetDir.ident, targetDir);
            }
        }
    }

    completeFunction(fn: Callable) {
        fn.file = this.getID();
        fn.dir = this.getDirID();
        fn.fileIdent = this.ident;
    }

    private loadFromDisk(): string {
        return readFileSync(this.path).toString();
    }

    isSource(): boolean {
        return this.ts || this.js;
    }

    getID(): string {
        return caculateHashID(this.ident);
    }

    getDirID(): string {
        if (this.dir) return this.dir.getID();
        return "";
    }

    dump(): file.SourceFile {
        const dumpPath = normalizePath(this.dir.path);
        const result: file.SourceFile = {
            id: this.getID(),
            name: this.name,
            path: dumpPath,
            pkg: this.dir.getID(),
            imports: [],
            deps: [],
        };
        for (const dep of this.deps.values()) {
            result.deps.push(dep.getID());
        }
        for (const i of this.imps.values()) {
            result.imports.push(i.getID());
        }
        return result;
    }
}
