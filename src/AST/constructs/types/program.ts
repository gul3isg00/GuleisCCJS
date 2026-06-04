import { ASTNode } from "../../ASTNode";
import { CFunction } from "../cFunction";

export class Program extends ASTNode {
  function_declaration: CFunction;

  constructor(function_declaration: CFunction) {
    super();
    this.function_declaration = function_declaration;
  }

  toString(): string {
    return `(Program | function_declaration: \n${this.function_declaration.toString()})\n\n`;
  }
}
