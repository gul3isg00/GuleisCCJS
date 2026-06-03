import { ASTNode } from "../../ASTNode";
import { CExpression } from "../cExpression";
import { ConstructType } from "../constructType";

const ALLOWED_OPERATORS = ["!", "-", "~"];

export class UnOp extends ASTNode {
  operator: string;
  expression: CExpression;

  readonly type = ConstructType.Exp as const;

  constructor(operator: string, expression: CExpression) {
    super();
    if (!UnOp.is_unop(operator)) {
      throw new Error(
        `Syntax Error: Expected Unary Operator but got '${operator}'`,
      );
    }
    this.operator = operator;
    this.expression = expression;
  }

  static is_unop(token: string): boolean {
    return token.length == 1 || ALLOWED_OPERATORS.indexOf(token) != -1;
  }

  toString(): string {
    return `<UnOp | operator: ${this.operator}, expression: \n${this.expression.toString()}>`;
  }
}
