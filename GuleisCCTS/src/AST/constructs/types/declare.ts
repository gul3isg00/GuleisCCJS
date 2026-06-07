import { ASTNode } from "../../ASTNode";
import { CExpression } from "../cExpression";

export class Declare extends ASTNode
{
  str: string;
  expression?: CExpression;

  constructor(str: string, expression?: CExpression)
  {
    super();
    this.str = str;
    this.expression = expression;
  }

  toString(): string
  {
    return `(Declare | string: ${this.str}, expression: ${this.expression?.toString()})`;
  }
}
