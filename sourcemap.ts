import { readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { chdir } from "node:process";
import type { Source } from "./protocol/map";
import { Dep, Dir, File } from "./sourcecode";

const packageName = "package.json";

export class Project {
    name: string;
    path: string;
    directory: string;
    registry: Map<string, string>;
    dirs: Map<string, Dir>;
    files: Map<string, File>;
    deps: Map<string, Dep>;
    excludes: Set<string>;
    allowDot: boolean;

    constructor(
        name: string,
        path: string,
        directory: string,
        excludes: string,
    ) {
        this.name = name;
        this.path = path;
        this.directory = directory;
        this.registry = new Map();
        this.dirs = new Map();
        this.files = new Map();
        this.deps = new Map();
        this.excludes = new Set();
        this.allowDot = true;

        const excludesList = excludes.split(",");
        for (const excl of excludesList) {
            const excl_ = excl.trim();
            if (excl_ === ".*") {
                this.allowDot = false;
            } else {
                this.excludes.add(join(excl_));
            }
        }
    }

    async scanRepository() {
        // if errors happen, exit the process immediately
        chdir(this.path);
        const projectPath = statSync(this.directory);
        if (!projectPath.isDirectory()) return;
        this.dirs.set(this.directory, new Dir(this.directory));
        await this.walkDirectory(this.directory);
    }

    // walk the given directory
    // find all the packages and files
    async walkDirectory(dir: string) {
        const entries = readdirSync(dir);
        for (const entry of entries) {
            const fullPath = join(dir, entry);
            if (this.excludes.has(fullPath)) {
                continue;
            }
            if (!this.allowDot && entry.startsWith(".")) {
                continue;
            }

            const stats = statSync(fullPath);
            if (stats.isDirectory()) {
                // handle directories
                this.dirs.set(fullPath, new Dir(fullPath));
                await this.walkDirectory(fullPath);
            } else {
                // handle files
                const dir = this.lookupDir(dirname(fullPath));
                if (dir) {
                    if (entry.endsWith(packageName)) {
                        dir.pkg = true;
                        const name = await this.retrivePackageName(fullPath);
                        if (name) this.registry.set(name, dir.path);
                    }
                    const f = new File(
                        fullPath,
                        dir,
                        this.lookupDep.bind(this),
                        this.registry,
                    );
                    this.files.set(fullPath, f);
                    this.deps.set(fullPath, new Dep(f));
                }
            }
        }
    }

    async retrivePackageName(filePath: string): Promise<string> {
        const f = Bun.file(filePath);
        const packageInfo = await f.json();
        if (packageInfo?.name) {
            return packageInfo.name;
        }
        return "";
    }

    // to parse all the files
    parseAllFiles() {
        for (const file of this.files.values()) {
            if (file.ts || file.js) file.parse();
        }
    }

    lookupDir(name: string): Dir | undefined {
        return this.dirs.get(name);
    }

    lookupDep(name: string): Dep | undefined {
        if (!name.endsWith(".ts") && !name.endsWith(".js")) {
            const tsName = `${name}.ts`;
            const jsName = `${name}.js`;
            if (this.deps.has(tsName)) return this.deps.get(tsName);
            if (this.deps.has(jsName)) return this.deps.get(jsName);
            return undefined;
        }
        if (this.deps.has(name)) return this.deps.get(name);
        return undefined;
    }

    dump(): Source {
        const result: Source = {
            name: this.name,
            lang: "Javascript",
            parser: "?",
            timestamp: "",
            repository: "",
            typ: "",
            version: "",
            pkgs: [],
            files: [],
            absts: [],
            fns: [],
            calls: [],
            refs: [],
            deps: [],
        };
        for (const d of this.dirs.values()) {
            result.pkgs.push(d.dump());
        }
        for (const f of this.files.values()) {
            if (f.ts || f.js || f.json) {
                const fileDump = f.dump();
                result.files.push(fileDump);
                if (f.ts || f.js) {
                    for (const fn of f.fns.values()) {
                        result.fns.push(fn.dump());
                    }
                }
            }
        }
        for (const d of this.deps.values()) {
            result.deps.push(d.dump());
        }

        return result;
    }
}
