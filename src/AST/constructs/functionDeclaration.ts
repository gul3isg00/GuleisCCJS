import { ASTNode } from "../ASTNode";

export class FunctionDeclaration extends ASTNode {
  name: string;
  statement: ASTNode;

  constructor(name: string, statement: ASTNode) {
    super();
    this.name = name;
    this.statement = statement;
  }
}
