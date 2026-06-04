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
${this.generateStatement(input.statements[0] as ReturnStatement)}`;
  }

  generateStatement(input: CStatement): string {
    const re = input as ReturnStatement
    return `${this.generateExpression(re.expression)}
 ret`;
  }

  generateExpression(input: CExpression): string {

    // If the expression is UNOP
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
    }

    // If the expression is BINOP 
    else if (input.constructor.name == "BinOp") {
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
          return `${exp_a}
 pushq %rax
${exp_b}
 movl %eax, %ebx
 popq %rax
 cltd
 idivl %ebx`
        case ("&&"):
          return `${exp_a}
 cmpl $0, %eax
 jne _clause2
 jmp _end
_clause2:
${exp_b}
 cmpl $0, %eax
 movl $0, %eax
 setne %al
_end:`;
        case ("||"):
          return `${exp_a}
 cmpl $0, %eax
 je _clause2
 movl $1, %eax
 jmp _end
_clause2:
${exp_b}
 cmpl $0, %eax
 movl $0, %eax
 setne %al
_end:`;
        case (">"):
          return `${exp_a}
 pushq %rax
${exp_b}
 popq %rcx
 cmpl %eax, %ecx
 movl $0, %eax
 setg %al`;
        case ("<"):
          return `${exp_a}
 pushq %rax
${exp_b}
 popq %rcx
 cmpl %eax, %ecx
 movl $0, %eax
 setl %al`;
        case ("=="):
          return `${exp_a}
 pushq %rax
${exp_b}
 popq %rcx
 cmpl %eax, %ecx
 movl $0, %eax
 sete %al`;
        case ("!="):
          return `${exp_a}
 pushq %rax
${exp_b}
 popq %rcx
 cmpl %eax, %ecx
 movl $0, %eax
 setne %al`;
        case (">="):
          return `${exp_a}
 pushq %rax
${exp_b}
 popq %rcx
 cmpl %eax, %ecx
 movl $0, %eax
 setge %al`;
        case ("<="):
          return `${exp_a}
 pushq %rax
${exp_b}
 popq %rcx
 cmpl %eax, %ecx
 movl $0, %eax
 setle %al`;
      }

      return "ERROR";

    }
    // Else the expression must be a CONSTANT
    else {
      return ` movl \$${(input as Constant).value.toString()}, %eax`
    }
  }
}
