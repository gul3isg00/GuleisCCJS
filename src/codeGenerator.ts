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
import { BinOp } from "./AST/constructs/types/binOp";

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
    return `${this.generateExpression(input.expression)}
 ret`;
  }

  generateExpression(input: CExpression): string {
    if (input.constructor.name == "UnOp") {
      const unop = input as UnOp;

      switch (unop.operator) {
        case ("!"):
          return `${this.generateExpression(unop.expression)}
 cmpl $0, %eax
 sete %al
 movzbl %al, %eax`;
        case ("-"):
          return `${this.generateExpression(unop.expression)}
neg %eax`;
        case ("~"):
          return `${this.generateExpression(unop.expression)}
not %eax`;
      }

      return 'wait'
    } else if (input.constructor.name == "BinOp") {
      const binop = input as BinOp;

      const exp_a = this.generateExpression(binop.expression_a);
      const exp_b = this.generateExpression(binop.expression_b);

      switch (binop.binary_operator) {
        case ("+"):
          return `${exp_a}
 pushq %rax
${exp_b}
 popq %rcx
 addl %ecx, %eax`
        case ("-"):
          return `${exp_b}
 pushq %rax
${exp_a}
 popq %rcx
 subl %ecx, %eax`
        case ("*"):
          return `${exp_a}
 pushq %rax
 ${exp_b}
 pop %rcx
 imul %ecx, %eax`
        case ("/"):
          return "div"
      }

      return "ERROR";

    } else {
      return ` movl \$${(input as Constant).value.toString()}, %eax`
    }
  }
}
