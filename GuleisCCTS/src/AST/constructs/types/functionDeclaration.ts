import { ASTNode, TreeVisualizerNode } from "../../ASTNode";
import { CBlock } from "../cBlock";
import { CStatement } from "../cStatement";

export class FunctionDeclaration extends ASTNode
{
  name: string;
  blocks: CBlock[];

  constructor(name: string, blocks: CBlock[])
  {
    super();
    this.name = name;
    this.blocks = blocks;
  }

  toString(): string
  {
    return `[Function Declaration | name: ${this.name}, blocks: ${this.blocks.map(s => s.toString())}]`;
  }

  toTree(): TreeVisualizerNode
  {
    return {
      name: "FunctionDeclaration",
      attributes: { "name": this.name },
      children: this.blocks.map(b => b.toTree())
    };
  }
}
