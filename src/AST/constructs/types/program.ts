import { ASTNode } from "../../ASTNode";
import { CFunction } from "../cFunction";
import { ConstructType } from "../constructType";

export class Program extends ASTNode {
  function_declaration: CFunction;

  readonly type = ConstructType.Prog as const;

  constructor(function_declaration: CFunction) {
    super();
    this.function_declaration = function_declaration;
  }

  toString(): string {
    return `(Program | function_declaration: \n${this.function_declaration.toString()})\n\n`;
  }
}
