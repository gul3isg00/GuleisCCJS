import { ASTNode, TreeVisualizerNode } from "../../ASTNode";
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
    return `{Return Statement | expression: ${this.expression.toString()}}`;
  }

  toTree(): TreeVisualizerNode
  {
    return {
      name: "ReturnStatement",
      children: [this.expression.toTree()]
    };
  }
}
