import { ASTNode } from "../../ASTNode";
import { CExpression } from "../cExpression";
import { ConstructType } from "../constructType";

export class ReturnStatement extends ASTNode {
  expression: CExpression;

  readonly type = ConstructType.State as const;

  constructor(expression: CExpression) {
    super();
    this.expression = expression;
  }

  toString(): string {
    return `{Return Statement | expression: \n${this.expression.toString()}}`;
  }
}
