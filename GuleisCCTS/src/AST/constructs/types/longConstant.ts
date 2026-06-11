import { ASTNode, TreeVisualizerNode } from "../../ASTNode";
import { Long } from "../cType";

export class LongConstant extends ASTNode
{
  value: Long;

  constructor(value: Long)
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
