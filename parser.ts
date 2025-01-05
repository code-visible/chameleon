import { join } from "path";
import { forEachChild, SyntaxKind, type Node, type SourceFile } from "typescript";

export class Parser {
  dir: string;
  sourceFile: SourceFile;
  imports: string[];

  constructor(dir: string, sourceFile: SourceFile) {
    this.dir = dir;
    this.sourceFile = sourceFile;
    this.imports = [];
  }

  parseSource() {
    this.parseNode(this.sourceFile);
  }

  parseNode(node: Node) {
    switch (node.kind) {
      case SyntaxKind.ImportDeclaration:
        this.parseImport(node);
        break;
      case SyntaxKind.FunctionDeclaration:
        this.parseFunction(node);
        break;
      case SyntaxKind.VariableDeclaration:
        this.parseVariableFunction(node);
        break;
    }
    forEachChild(node, this.parseNode.bind(this));
  }

  parseImport(node: Node) {
    let currentPath = node.getChildren(this.sourceFile)[3].getText(this.sourceFile);
    currentPath = currentPath.replaceAll("\"", "");
    const relPath = join(this.dir, currentPath);
    this.imports.push(relPath);
  }

  parseFunction(node: Node) {
    // TODO
  }

  parseVariableFunction(node: Node) {
    // TODO
  }
};