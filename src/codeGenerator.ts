import { ASTNode } from "./AST/ASTNode";
import fs from "fs";
import { FunctionDeclaration } from "./AST/constructs/types/functionDeclaration";
import { Program } from "./AST/constructs/types/program";
import { ReturnStatement } from "./AST/constructs/types/returnStatement";
import { Constant } from "./AST/constructs/types/constant";

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

  generateProgram(input: Program): string {
    return this.generateFunction(
      input.function_declaration as FunctionDeclaration,
    );
  }

  generateFunction(input: FunctionDeclaration): string {
    return `.globl ${input.name}
${input.name}:
${this.generateStatement(input.statement as ReturnStatement)}`;
  }

  generateStatement(input: ReturnStatement): string {
    return ` movl    \$${this.generateExpression(input.expression as Constant)}, %eax
 ret`;
  }

  generateExpression(input: Constant): string {
    return input.value.toString();
  }
}
