import { ASTNode } from "../../ASTNode";
import { ConstructType } from "../constructType";

const ALLOWED_OPERATORS = ["!", "-", "~"];

export class UnOp extends ASTNode {
  operator: string;
  expression: ASTNode;

  readonly type = ConstructType.Exp as const;

  constructor(operator: string, expression: ASTNode) {
    super();
    if (operator.length > 1 || ALLOWED_OPERATORS.indexOf(operator) == -1) {
      throw new Error(
        `Syntax Error: Expected Unary Operator but got '${operator}'`,
      );
    }
    this.operator = operator;
    this.expression = expression;
  }

  toString(): string {
    return `<UnOp | operator: ${this.operator}, expression: \n${this.expression.toString()}>`;
  }
}
