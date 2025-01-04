import { readdirSync, statSync } from "fs";
import { Dir, File } from "./filesystem";
import { basename, dirname, join } from "path";
import { chdir } from "process";

// resource map of our project
export class Resource {
  name: string;
  path: string;
  directory: string;
  dirs: Map<string, Dir>;
  files: File[];

  constructor(name: string, path: string, directory: string) {
    this.name = name;
    this.path = path;
    this.directory = directory;
    this.dirs = new Map();
    this.files = [];
  }

  walk() {
    // if errors happen, exit the process immediately
    chdir(this.path);
    this.walkDirectory(this.directory);
  }

  // walk the given directory
  // find all the directories and files
  walkDirectory(dir: string) {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stats = statSync(fullPath);

      if (stats.isDirectory()) {
        // handle directories
        this.dirs.set(fullPath, new Dir(fullPath));
        this.walkDirectory(fullPath);
      } else {
        // handle files
        const fileDir = dirname(fullPath);
        const fileName = basename(fullPath);
        this.files.push(new File(fileDir, fileName, this.dirs.get(fileDir)!));
      }
    }
  }

  // to parse all the files
  parseAllFiles() { }
};