export interface SourceFile {
  id: string;
  name: string;
  path: string;
  pkg: string;
  imports: string[];
  deps: string[];
};
