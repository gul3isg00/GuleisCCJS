import { ASTNode, TreeVisualizerNode } from "../../ASTNode";
import { Int } from "../cType";

export class IntegerConstant extends ASTNode
{
  value: Int;

  constructor(value: Int)
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
