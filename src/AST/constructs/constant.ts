import { ASTNode } from "../ASTNode";

export class Constant extends ASTNode {
  value: number;

  constructor(value: number) {
    super();
    this.value = value;
  }
}
