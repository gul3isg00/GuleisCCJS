import { ASTNode } from "../../ASTNode";
import { CStatement } from "../cStatement";

export class FunctionDeclaration extends ASTNode {
  name: string;
  statements: CStatement[];

  constructor(name: string, statements: CStatement[]) {
    super();
    this.name = name;
    this.statements = statements;
  }

  toString(): string {
    return `[Function Declaration | name: ${this.name}, statement: \n${this.statements.length}]`;
  }
}
