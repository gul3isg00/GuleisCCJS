import { ASTNode, TreeVisualizerNode } from "../../ASTNode";
import { CBlock } from "../cBlock";
import { CStatement } from "../cStatement";

export class FunctionDeclaration extends ASTNode
{
  name: string;
  params: string[];
  blocks: CBlock[];

  constructor(name: string, blocks: CBlock[], params: string[])
  {
    super();
    this.name = name;
    this.blocks = blocks;
    this.params = params;
  }

  toString(): string
  {
    return `[Function Declaration | name: ${this.name}, blocks: ${this.blocks.map(s => s.toString())}, params: ${this.params}]`;
  }

  toTree(): TreeVisualizerNode
  {
    return {
      name: "FunctionDeclaration",
      attributes: { "name": this.name, "params": this.params },
      children: this.blocks.map(b => b.toTree())
    };
  }
}
