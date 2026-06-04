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
import { Declare } from "./AST/constructs/types/declare";

export class CodeGenerator {
  save_location: string;
  variable_map: { [key: string]: string };

  constructor(save_location: string) {
    this.save_location = save_location.replace(".c", ".s");
    this.variable_map = {}
  }

  emit(input: string) {
    fs.appendFileSync(this.save_location, input);
  }

  generate(input: ASTNode) {
    fs.writeFileSync(this.save_location, "",);
    this.generateProgram(input as CProgram);
  }

  generateProgram(input: CProgram): void {
    this.generateFunction(input.function_declaration as FunctionDeclaration);
  }

  generateFunction(input: CFunction): void {
    this.emit(`.globl ${input.name}
${input.name}:`);
    this.generateStatement(input.statements)
  }

  // TODO
  generateStatement(inputs: CStatement[]): void {
    inputs.forEach((input) => {
      if (input.constructor.name == "ReturnStatement") {
        const re = input as ReturnStatement
        return `${this.generateExpression(re.expression)}
 ret`;
      } else if (input.constructor.name == "Declare") {
        const dec = input as Declare;

        if (this.variable_map[dec.str] != null) {
          throw new Error(`XYZ Error: Variable ${dec.str} defined more than once.`);
        }

        if (dec.expression) {
          const exp = this.generateExpression(dec.expression);

        }

        return "test"
      } else {
        const exp = input as CExpression;
        return this.generateExpression(exp)
      }
    })

  }

  // TODO
  generateExpression(input: CExpression): void {

    // If the expression is UNOP
    if (input.constructor.name == "UnOp") {
      const unop = input as UnOp;

      this.generateExpression(unop.expression);

      if (unop.operator == "!") {
        this.emit(` cmpl $0, %eax
 sete %al
 movzbl %al, %eax`);
      } else if (unop.operator == "-") {
        this.generateExpression(unop.expression)
        this.emit(` neg %eax`);
      } else {
        this.emit(` not %eax`);
      }
    }

    // If the expression is BINOP 
    else if (input.constructor.name == "BinOp") {
      const binop = input as BinOp;

      if (binop.binary_operator == "+") {
        this.generateExpression(binop.expression_a);
        this.emit(` pushq % rax`);
        this.generateExpression(binop.expression_b);
        this.emit(` popq % rcx
 addl % ecx, % eax`);

      } else if (binop.binary_operator == "-") {

        this.generateExpression(binop.expression_b);
        this.emit(` pushq % rax`);
        this.generateExpression(binop.expression_a);
        this.emit(` popq % rcx
 subl % ecx, % eax`);

      } else if (binop.binary_operator == "*") {

        this.generateExpression(binop.expression_a);
        this.emit(` pushq % rax`);
        this.generateExpression(binop.expression_b);
        this.emit(` pop % rcx
  imul % ecx, % eax`);

      } else if (binop.binary_operator == "/") {

        this.generateExpression(binop.expression_a);
        this.emit(` pushq % rax`);
        this.generateExpression(binop.expression_b);
        this.emit(` movl % eax, % ebx
 popq % rax
 cltd
 idivl % ebx`);

      } else if (binop.binary_operator == "==") {

        this.generateExpression(binop.expression_a);
        this.emit(` pushq % rax`);
        this.generateExpression(binop.expression_b);
        this.emit(` popq % rcx
 cmpl % eax, % ecx
 movl $0, % eax
 sete % al`);

      } else if (binop.binary_operator == "!=") {

        this.generateExpression(binop.expression_a);
        this.emit(` pushq % rax`);
        this.generateExpression(binop.expression_b);
        this.emit(` popq % rcx
 cmpl % eax, % ecx
 movl $0, % eax
 setne % al`);

      } else if (binop.binary_operator == "<=") {

        this.generateExpression(binop.expression_a);
        this.emit(` pushq % rax`);
        this.generateExpression(binop.expression_b);
        this.emit(` popq % rcx
 cmpl % eax, % ecx
 movl $0, % eax
 setle % al`);

      } else if (binop.binary_operator == ">=") {

        this.generateExpression(binop.expression_a);
        this.emit(` pushq % rax`);
        this.generateExpression(binop.expression_b);
        this.emit(` popq % rcx
 cmpl % eax, % ecx
 movl $0, % eax
 setge % al`);

      } else if (binop.binary_operator == "&&") {

        this.generateExpression(binop.expression_a);
        this.emit(` cmpl $0, % eax
 jne _clause2
 jmp _end
_clause2:`);
        this.generateExpression(binop.expression_b);
        this.emit(`  cmpl $0, % eax
 movl $0, % eax
 setne % al
_end: `);

      } else if (binop.binary_operator == "||") {

        this.generateExpression(binop.expression_a);
        this.emit(` cmpl $0, % eax
 je _clause2
 movl $1, % eax
 jmp _end
_clause2:`);
        this.generateExpression(binop.expression_b);
        this.emit(` cmpl $0, % eax
 movl $0, % eax
 setne % al
_end: `);


      } else if (binop.binary_operator == ">") {
        this.generateExpression(binop.expression_a);
        this.emit(` pushq % rax`);
        this.generateExpression(binop.expression_b);
        this.emit(` popq % rcx
 cmpl % eax, % ecx
 movl $0, % eax
 setg % al`);

      }
      // Less than
      else {

        this.generateExpression(binop.expression_a);
        this.emit(` pushq % rax`);
        this.generateExpression(binop.expression_b);
        this.emit(` popq % rcx
 cmpl % eax, % ecx
 movl $0, % eax
 setl % al`);

      }
    }
    // Else the expression must be a CONSTANT
    else {
      this.emit(` movl \$${(input as Constant).value.toString()}, % eax`)
    }
  }
}
