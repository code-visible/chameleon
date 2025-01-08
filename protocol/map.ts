import type { SourceAbstract } from "./abstract";
import type { SourceCall } from "./call";
import type { SourceCallable } from "./callable";
import type { SourceDep } from "./dep";
import type { SourceFile } from "./file";
import type { SourcePkg } from "./pkg";

export interface Source {
  name: string;
  directory: string;
  language: string;
  pkgs: SourcePkg[];
  files: SourceFile[];
  abstracts: SourceAbstract[];
  callables: SourceCallable[];
  calls: SourceCall[];
  deps: SourceDep[];
};