import { ASTNode } from "../../ASTNode";
import { CExpression } from "../cExpression";

export class Assign extends ASTNode {
  str: string;
  expression: CExpression;

  constructor(str: string, expression: CExpression) {
    super();
    this.str = str;
    this.expression = expression;
  }

  toString(): string {
    return `(Assign | string: \n${this.str})\n\n`;
  }
}
