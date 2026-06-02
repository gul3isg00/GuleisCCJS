import { ConstructType } from "./constructs/constructType";
import { CProgram } from "./constructs/cProgram";

export abstract class ASTNode {
  abstract toString(): string;

  print() {
    console.log(this.toString());
  }
}
