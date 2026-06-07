import { ASTNode, TreeVisualizerNode } from "../../ASTNode";

export class Constant extends ASTNode
{
  value: number;

  constructor(value: number)
  {
    super();
    this.value = value;
  }

  toString(): string
  {
    return `<Constant | value: ${this.value}>`;
  }

  toTree(): TreeVisualizerNode
  {
    return {
      name: "Constant",
      attributes: { "value": this.value },
    };
  }
}
