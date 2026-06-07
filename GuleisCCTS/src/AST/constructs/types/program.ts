import { ASTNode, TreeVisualizerNode } from "../../ASTNode";
import { CFunction } from "../cFunction";

export class Program extends ASTNode
{
  function_declaration: CFunction;

  constructor(function_declaration: CFunction)
  {
    super();
    this.function_declaration = function_declaration;
  }

  toString(): string
  {
    return `(Program | function_declaration: ${this.function_declaration.toString()})`;
  }

  toTree(): TreeVisualizerNode
  {
    return {
      name: "Program",
      children: [this.function_declaration.toTree()]
    };
  }
}
