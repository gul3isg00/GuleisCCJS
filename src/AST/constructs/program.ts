import { ASTNode } from "../ASTNode";

export class Program extends ASTNode {
  function_declaration: ASTNode;

  constructor(function_declaration: ASTNode) {
    super();
    this.function_declaration = function_declaration;
  }
}
