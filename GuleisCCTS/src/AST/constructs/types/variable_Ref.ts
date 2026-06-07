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
      name: "VariableRef",
      attributes: { "str": this.str },
    };
  }
}
