import { ASTNode, TreeVisualizerNode } from "../../ASTNode";
import { CExpression } from "../cExpression";

export class Assign extends ASTNode
{
  str: string;
  expression: CExpression;

  constructor(str: string, expression: CExpression)
  {
    super();
    this.str = str;
    this.expression = expression;
  }

  toString(): string
  {
    return `(Assign | string: ${this.str}, expression: ${this.expression})`;
  }

  toTree(): TreeVisualizerNode
  {
    return {
      name: "Assign",
      attributes: { "str": this.str },
      children: [this.expression.toTree()]
    };
  }
}
