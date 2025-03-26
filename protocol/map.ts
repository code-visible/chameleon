import type { SourceAbstract } from "./abstract";
import type { SourceCall } from "./call";
import type { SourceCallable } from "./callable";
import type { SourceDep } from "./dep";
import type { SourceFile } from "./file";
import type { SourcePkg } from "./pkg";

export interface Source {
  name: string;
  lang: string;
  parser: string;
  timestamp: string;
  repository: string;
  typ: string;
  version: string;
  pkgs: SourcePkg[];
  files: SourceFile[];
  absts: SourceAbstract[];
  fns: SourceCallable[];
  calls: SourceCall[];
  refs: SourceCall[];
  deps: SourceDep[];
};