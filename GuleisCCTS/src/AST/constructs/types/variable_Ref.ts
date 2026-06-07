import { ASTNode } from "../../ASTNode";

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
}
