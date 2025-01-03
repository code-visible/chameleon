import { forEachChild, type Node, type SourceFile } from "typescript";

export class File {
  constructor() { }

  parse(sourceFile: SourceFile) {
    this.traverse(sourceFile);
  }

  traverse(node: Node) {
    forEachChild(node, this.traverse.bind(this));
  }
};