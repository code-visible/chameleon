import { join } from "path";
import { forEachChild, SyntaxKind, type Node, type SourceFile } from "typescript";
import { Function } from "./call";

export class Parser {
  dir: string;
  sourceFile: SourceFile;
  imports: string[];
  fns: Map<string, Function>;
  abstract: string;
  fn: string;

  constructor(dir: string, sourceFile: SourceFile) {
    this.dir = dir;
    this.sourceFile = sourceFile;
    this.imports = [];
    this.fns = new Map();
    this.abstract = "";
    this.fn = "";
  }

  parseSource() {
    this.parseNode(this.sourceFile);
  }

  // search global nodes
  parseNode(node: Node) {
    switch (node.kind) {
      case SyntaxKind.ImportDeclaration:
        this.parseImport(node);
        return;
      case SyntaxKind.FunctionDeclaration:
        this.parseFunction(node);
        return;
      case SyntaxKind.ClassDeclaration:
        this.parseClass(node);
        return;
      case SyntaxKind.VariableDeclaration:
        this.parseVariable(node);
        return;
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
    let start = false;
    const fn = [];
    for (const el of node.getChildren(this.sourceFile)) {
      if (start) fn.push(el.getText(this.sourceFile));
      if (el.kind === SyntaxKind.FunctionKeyword) start = true;
      if (el.kind === SyntaxKind.CloseParenToken) break;
    }
    if (fn.length > 0) {
      const id = fn[0]
      const func = new Function(id);
      this.fns.set(id, func);
      this.fn = id;
      forEachChild(node, this.searchCall.bind(this));
    }
  }

  searchCall(node: Node) {
    if (node.kind === SyntaxKind.CallExpression) {
      this.parseCall(node);
      return;
    }
    forEachChild(node, this.searchCall.bind(this));
  }

  parseCall(node: Node) {
    // console.log("=------", this.fn, node.kind, node.getText(this.sourceFile));
  }

  parseMethod(node: Node) {
    const fn = [];
    for (const el of node.getChildren(this.sourceFile)) {
      fn.push(el.getText(this.sourceFile));
      if (el.kind === SyntaxKind.CloseParenToken) {
        el.getText(this.sourceFile);
        break;
      }
    }
    if (fn.length > 0) {
      const id = `${this.abstract}.${fn[0]}`
      const func = new Function(fn[0], this.abstract);
      this.fns.set(id, func);
      this.fn = id;
      forEachChild(node, this.searchCall.bind(this));
    }
  }

  parseVariable(node: Node) {
    const fn = [];
    let identifier = "";
    let isArrowFunction = false;
    for (const el of node.getChildren(this.sourceFile)) {
      if (SyntaxKind.Identifier) {
        identifier = el.getText(this.sourceFile);
        continue;
      }
      if (el.kind === SyntaxKind.ArrowFunction) {
        isArrowFunction = true;
        break;
      }
    }
    if (isArrowFunction && identifier) {
      const func = new Function(identifier);
      this.fns.set(identifier, func);
    }
  }

  searchMethod(node: Node) {
    if (node.kind === SyntaxKind.MethodDeclaration) {
      this.parseMethod(node);
      return;
    }
    forEachChild(node, this.searchMethod.bind(this));
  }

  parseClass(node: Node) {
    for (const el of node.getChildren(this.sourceFile)) {
      if (el.kind === SyntaxKind.Identifier) {
        this.abstract = el.getText(this.sourceFile);
        break;
      }
    }
    forEachChild(node, this.parseMethod.bind(this));
  }
};