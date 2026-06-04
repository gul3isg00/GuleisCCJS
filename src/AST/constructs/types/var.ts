import { ASTNode } from "../../ASTNode";

export class Var extends ASTNode {
  str: string;

  constructor(str: string) {
    super();
    this.str = str;
  }

  toString(): string {
    return `(Var | string: \n${this.str})\n\n`;
  }
}
