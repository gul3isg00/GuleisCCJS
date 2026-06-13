import { ASTNode, TreeVisualizerNode } from "../../../ASTNode";
import { CDeclaration } from "../../cDeclaration";

export class Program extends ASTNode
{
  items?: CDeclaration[];

  constructor(items?: CDeclaration[])
  {
    super();
    this.items = items;
  }

  toString(): string
  {
    return `(Program | items: ${this.items ? this.items.map(p => p.toString()) : ""})`;
  }

  toTree(): TreeVisualizerNode
  {
    return {
      name: "Program",
      children: this.items ? this.items.map(p => p.toTree()) : []
    };
  }
}
