import { ASTNode } from "../../ASTNode";
import { CExpression } from "../cExpression";

export class ReturnStatement extends ASTNode
{
  expression: CExpression;

  constructor(expression: CExpression)
  {
    super();
    this.expression = expression;
  }

  toString(): string
  {
    return `{Return Statement | expression: \n${this.expression.toString()}}`;
  }
}
