import type { Node } from "typescript";

export class ASTParser {
  static parseImport(node: Node) {
    console.log(node.getText());
  }
};