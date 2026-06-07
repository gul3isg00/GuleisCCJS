import { ASTNode, TreeVisualizerNode } from "../../ASTNode";
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

  toTree(): TreeVisualizerNode
  {
    return {
      name: "Declare",
      attributes: { "str": this.str },
      children: this.expression ? [this.expression.toTree()] : []
    };
  }
}
