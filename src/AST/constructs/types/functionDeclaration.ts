import { ASTNode } from "../../ASTNode";
import { ConstructType } from "../constructType";
import { CStatement } from "../cStatement";

export class FunctionDeclaration extends ASTNode {
  name: string;
  statement: CStatement;

  readonly type = ConstructType.Func as const;

  constructor(name: string, statement: CStatement) {
    super();
    this.name = name;
    this.statement = statement;
  }

  toString(): string {
    return `[Function Declaration | name: ${this.name}, statement: \n${this.statement.toString()}]`;
  }
}
