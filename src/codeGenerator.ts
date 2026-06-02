import { ASTNode } from "./AST/ASTNode";
import fs from "fs";
import { FunctionDeclaration } from "./AST/constructs/types/functionDeclaration";
import { Program } from "./AST/constructs/types/program";
import { ReturnStatement } from "./AST/constructs/types/returnStatement";
import { Constant } from "./AST/constructs/types/constant";
import { CExpression } from "./AST/constructs/cExpression";
import { CStatement } from "./AST/constructs/cStatement";
import { CFunction } from "./AST/constructs/cFunction";
import { CProgram } from "./AST/constructs/cProgram";
import { UnOp } from "./AST/constructs/types/unop";

export class CodeGenerator {
  save_location: string;

  constructor(save_location: string) {
    this.save_location = save_location.replace(".c", ".s");
  }

  generate(input: ASTNode) {
    fs.writeFileSync(
      this.save_location,
      this.generateProgram(input as Program),
    );
  }

  generateProgram(input: CProgram): string {
    return this.generateFunction(
      input.function_declaration as FunctionDeclaration,
    );
  }

  generateFunction(input: CFunction): string {
    return `.globl ${input.name}
${input.name}:
${this.generateStatement(input.statement as ReturnStatement)}`;
  }

  generateStatement(input: CStatement): string {
    return ` movl    \$${this.generateExpression(input.expression as Constant)}, %eax
 ret`;
  }

  generateExpression(input: CExpression): string {
    if (input.constructor.name == "UnOp") {
      // const unop = input as UnOp;
      // switch (unop.expression){
      //   case("-"):
      //     break;

      // }
      return "UnOp - WIP"

    } else {
      return (input as Constant).value.toString();
    }
  }
}
