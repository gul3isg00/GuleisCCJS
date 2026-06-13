import { ASTNode, TreeVisualizerNode } from "../../../ASTNode";

export class IntegerConstant extends ASTNode
{
  value: number;

  constructor(value: number)
  {
    super();
    this.value = value;
  }

  toString(): string
  {
    return `<IntegerConstant | value: ${this.value}>`;
  }

  toTree(): TreeVisualizerNode
  {
    return {
      name: "IntegerConstant",
      attributes: { "value": this.value },
    };
  }
}
