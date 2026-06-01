import { ASTNode } from "../ASTNode";

// Returns an expression.
// <exp> ::= <int>
export class ReturnStatement extends ASTNode {
  expression: ASTNode;
  
  constructor(expression: ASTNode) {
    super();
    this.expression = expression;
  }
}
