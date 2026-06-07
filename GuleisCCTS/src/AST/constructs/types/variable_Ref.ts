import { ASTNode, TreeVisualizerNode } from "../../ASTNode";

export class VariableRef extends ASTNode
{
  str: string;

  constructor(str: string)
  {
    super();
    this.str = str;
  }

  toString(): string
  {
    return `(VariableRef | string: ${this.str})`;
  }

  toTree(): TreeVisualizerNode
  {
    return {
      name: "BinOp",
      attributes: { "str": this.str },
    };
  }
}
