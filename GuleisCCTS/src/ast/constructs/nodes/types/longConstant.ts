import { ASTNode, TreeVisualizerNode } from "../../../ASTNode";

export class LongConstant extends ASTNode
{
  value: number;

  constructor(value: number)
  {
    super();
    this.value = value;
  }

  toString(): string
  {
    return `<LongConstant | value: ${this.value}>`;
  }

  toTree(): TreeVisualizerNode
  {
    return {
      name: "LongConstant",
      attributes: { "value": this.value },
    };
  }
}
