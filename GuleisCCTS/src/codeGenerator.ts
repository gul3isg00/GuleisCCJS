import { ASTNode } from "./AST/ASTNode";
import fs from "fs";
import { FunctionDeclaration } from "./AST/constructs/types/functionDeclaration";
import { ReturnStatement } from "./AST/constructs/types/returnStatement";
import { Constant } from "./AST/constructs/types/constant";
import { CExpression } from "./AST/constructs/cExpression";
import { CStatement } from "./AST/constructs/cStatement";
import { CDeclaration } from "./AST/constructs/cDeclaration";
import { CFunction } from "./AST/constructs/cFunction";
import { CProgram } from "./AST/constructs/cProgram";
import { UnOp } from "./AST/constructs/types/unop";
import { BinOp } from "./AST/constructs/types/binOp";
import { Declare } from "./AST/constructs/types/declare";
import { Assign } from "./AST/constructs/types/assign";
import { VariableRef } from "./AST/constructs/types/variable_Ref";
import { CBlock } from "./AST/constructs/cBlock";
import { Conditional } from "./AST/constructs/types/conditional";
import { ConditionalExpression } from "./AST/constructs/types/conditionalExpression";

const NUM_OF_BYTES: number = 8;
const ESP: number = 0;

export abstract class CodeGenerator
{
  variable_map: { [key: string]: number };
  stack_index: number = ESP - NUM_OF_BYTES;

  label_counter: number = 0;

  constructor()
  {
    this.variable_map = {}
  }

  abstract emit(input: string): void;

  abstract generate(input: ASTNode): string;

  _generateProgram(input: CProgram)
  {
    this._generateFunction(input.function_declaration as FunctionDeclaration);
  }

  _generateFunction(input: CFunction)
  {
    this.emit(`.globl ${input.name}                 ; make ${input.name} visible to linker
${input.name}:                              ; label for ${input.name}
 pushq %rbp                         ; save base pointer
 movq %rsp, %rbp                    ; set base pointer to stack pointer`);

    this._generateBlocks(input.blocks)

    let hasReturnStatement = false;

    if (input.name == "main")
    {
      for (let x = input.blocks.length - 1; x >= 0; x--)
      {
        if (input.blocks[x] instanceof ReturnStatement)
        {
          hasReturnStatement = true;
          break;
        };
      }

      if (!hasReturnStatement)
      {
        this._generateStatement(new ReturnStatement(new Constant(0)));
      }
    }
  }

  _generateBlocks(inputs: CBlock[])
  {
    inputs.forEach((input) =>
    {
      if (input instanceof Declare)
      {
        this._generateDeclaration(input);
      } else
      {
        this._generateStatement(input);
      }
    })
  }

  _generateStatement(input: CStatement)
  {
    if (input instanceof ReturnStatement)
    {
      this._generateReturnStatement(input as ReturnStatement);
    } else if (input instanceof Conditional)
    {
      this._generateConditional(input as Conditional)
    } else
    {
      this._generateExpression(input as CExpression)
    }
  }

  _generateReturnStatement(retState: ReturnStatement)
  {
    this._generateExpression(retState.expression);
    this.emit(` movq %rbp, %rsp                  ; restore stack pointer
 popq %rbp                          ; restore base pointer
 ret                                ; return from function`);
  }

  _generateConditional(cond: Conditional)
  {
    const id = this.label_counter++;
    this._generateExpression(cond.expression);
    this.emit(` cmpl $0, %eax                      ; compare eax to 0
 je _cond_${id}                         ; jump if equal to _cond_${id}`);
    this._generateStatement(cond.if_statement);
    this.emit(` jmp _post_conditional_${id}            ; jump unconditionally to _post_conditional_${id}
_cond_${id}:                             ; label for _cond_${id}`);
    if (cond.else_statement != null)
    {
      this._generateStatement(cond.else_statement);
    }
    this.emit(`_post_conditional_${id}:                 ; label for _post_conditional_${id}`);
  }

  _generateDeclaration(input: CDeclaration)
  {
    this._generateDeclare(input);
  }

  _generateDeclare(dec: Declare)
  {
    if (this.variable_map[dec.str] != null)
    {
      throw new Error(`Semantic Error: Variable ${dec.str} defined more than once.`);
    }

    if (dec.expression)
    {
      this._generateExpression(dec.expression);
    } else
    {
      this._generateExpression(new Constant(0));
    }

    this.emit(` pushq %rax                         ; push rax onto the stack`);

    this.variable_map[dec.str] = this.stack_index;

    this.stack_index -= NUM_OF_BYTES;
  }

  _generateExpression(input: CExpression)
  {

    if (input instanceof UnOp)
    {
      this._generateUnOp(input as UnOp);
    }
    else if (input instanceof Assign)
    {
      this._generateAssign(input as Assign);
    }
    else if (input instanceof VariableRef)
    {
      this._generateVariableRef(input as VariableRef);
    }
    else if (input instanceof BinOp)
    {
      this._generateBinOp(input as BinOp);
    } else if (input instanceof ConditionalExpression)
    {
      this._generateConditionalExpression(input as ConditionalExpression);
    }
    else
    {
      this._generateConstant(input as Constant);
    }
  }

  _generateConditionalExpression(cond: ConditionalExpression)
  {
    const id = this.label_counter++;
    this._generateExpression(cond.condition);
    this.emit(` cmpl $0, %eax                      ; compare eax to 0
 je _cond_${id}                         ; jump if equal to _cond_${id}`);
    this._generateExpression(cond.if_statement);
    this.emit(` jmp _post_conditional_${id}            ; jump unconditionally to _post_conditional_${id}
_cond_${id}:                             ; label for _cond_${id}`);
    this._generateExpression(cond.else_statement);
    this.emit(`_post_conditional_${id}:                 ; label for _post_conditional_${id}`);
  }

  _generateAssign(ass: Assign)
  {

    if (!this.variable_map[ass.str])
    {
      throw new Error(`Semantic Error: Undeclared identifier '${ass.str}'`);
    }

    this._generateExpression(ass.expression);
    const offset = this.variable_map[ass.str];
    this.emit(` movl %eax, ${offset}(%rbp)                ; move eax into local variable at offset ${offset}`);
  }

  _generateVariableRef(varRef: VariableRef)
  {
    if (!this.variable_map[varRef.str])
    {
      throw new Error(`Semantic Error: Undeclared identifier '${varRef.str}'`);
    }

    const offset = this.variable_map[varRef.str];
    this.emit(` movl ${offset}(%rbp), %eax                ; move local variable at offset ${offset} into eax`);
  }

  _generateUnOp(unop: UnOp)
  {
    this._generateExpression(unop.expression);

    if (unop.operator == "!")
    {
      this.emit(` cmpl $0, %eax                      ; compare eax to 0
 sete %al                           ; set al to 1 if equal, 0 otherwise
 movzbl %al, %eax                   ; zero-extend al to eax`);
    } else if (unop.operator == "-")
    {
      this._generateExpression(unop.expression)
      this.emit(` neg %eax                           ; negate eax (two's complement)`);

    } else if (unop.operator == "++")
    {
      this._generateExpression(new BinOp("+=", unop.expression, new Constant(1)));
    } else if (unop.operator == "--")
    {
      this._generateExpression(new BinOp("-=", unop.expression, new Constant(1)));
    } else
    {
      this.emit(` not %eax                           ; bitwise NOT on eax`);
    }
  }

  _generateConstant(con: Constant)
  {
    this.emit(` movl \$${con.value.toString()}, %eax                ; move constant ${con.value.toString()} into eax`);
  }

  _generateBinOp(binop: BinOp)
  {
    const compoundAssignments = ["+=", "-=", "*=", "/=", "%=", ">>=", "<<=", "&=", "|=", "^="];

    if (binop.binary_operator == "+")
    {
      this._generateExpression(binop.expression_a);
      this.emit(` pushq %rax                         ; push rax onto the stack`);
      this._generateExpression(binop.expression_b);
      this.emit(` popq %rcx                          ; pop stack into rcx
 addl %ecx, %eax                    ; add ecx to eax`);

    } else if (binop.binary_operator == "-")
    {
      this._generateExpression(binop.expression_b);
      this.emit(` pushq %rax                         ; push rax onto the stack`);
      this._generateExpression(binop.expression_a);
      this.emit(` popq %rcx                          ; pop stack into rcx
 subl %ecx, %eax                    ; subtract ecx from eax`);

    } else if (binop.binary_operator == "*")
    {
      this._generateExpression(binop.expression_a);
      this.emit(` pushq %rax                         ; push rax onto the stack`);
      this._generateExpression(binop.expression_b);
      this.emit(` popq %rcx                          ; pop stack into rcx
 imul %ecx, %eax                    ; multiply eax by ecx`);

    } else if (binop.binary_operator == "/")
    {
      this._generateExpression(binop.expression_a);
      this.emit(` pushq %rax                         ; push rax onto the stack`);
      this._generateExpression(binop.expression_b);
      this.emit(` movl %eax, %ebx                    ; move eax into ebx
 popq %rax                          ; pop stack into rax
 cltd                               ; sign-extend eax into edx:eax
 idivl %ebx                         ; divide edx:eax by ebx`);

    } else if (binop.binary_operator == "==")
    {
      this._generateExpression(binop.expression_a);
      this.emit(` pushq %rax                         ; push rax onto the stack`);
      this._generateExpression(binop.expression_b);
      this.emit(` popq %rcx                          ; pop stack into rcx
 cmpl %eax, %ecx                    ; compare eax and ecx
 movl $0, %eax                      ; move 0 into eax
 sete %al                           ; set al to 1 if equal`);

    } else if (binop.binary_operator == "!=")
    {
      this._generateExpression(binop.expression_a);
      this.emit(` pushq %rax                         ; push rax onto the stack`);
      this._generateExpression(binop.expression_b);
      this.emit(` popq %rcx                          ; pop stack into rcx
 cmpl %eax, %ecx                    ; compare eax and ecx
 movl $0, %eax                      ; move 0 into eax
 setne %al                          ; set al to 1 if not equal`);

    } else if (binop.binary_operator == "<=")
    {
      this._generateExpression(binop.expression_a);
      this.emit(` pushq %rax                         ; push rax onto the stack`);
      this._generateExpression(binop.expression_b);
      this.emit(` popq %rcx                          ; pop stack into rcx
 cmpl %eax, %ecx                    ; compare eax and ecx
 movl $0, %eax                      ; move 0 into eax
 setle %al                          ; set al to 1 if less or equal`);

    } else if (binop.binary_operator == ">=")
    {
      this._generateExpression(binop.expression_a);
      this.emit(` pushq %rax                         ; push rax onto the stack`);
      this._generateExpression(binop.expression_b);
      this.emit(` popq %rcx                          ; pop stack into rcx
 cmpl %eax, %ecx                    ; compare eax and ecx
 movl $0, %eax                      ; move 0 into eax
 setge %al                          ; set al to 1 if greater or equal`);

    } else if (binop.binary_operator == "&&")
    {
      const id = this.label_counter++;
      this._generateExpression(binop.expression_a);
      this.emit(` cmpl $0, %eax                      ; compare eax to 0
 jne _clause2_${id}                     ; jump if not equal to _clause2_${id}
 jmp _end_${id}                         ; jump unconditionally to _end_${id}
_clause2_${id}:                          ; label for _clause2_${id}`);
      this._generateExpression(binop.expression_b);
      this.emit(` cmpl $0, %eax                      ; compare eax to 0
 movl $0, %eax                      ; move 0 into eax
 setne %al                          ; set al to 1 if not equal
_end_${id}:                              ; label for _end_${id}`);

    } else if (binop.binary_operator == "||")
    {
      const id = this.label_counter++;
      this._generateExpression(binop.expression_a);
      this.emit(` cmpl $0, %eax                      ; compare eax to 0
 je _clause2_${id}                      ; jump if equal to _clause2_${id}
 movl $1, %eax                      ; move 1 into eax
 jmp _end_${id}                         ; jump unconditionally to _end_${id}
_clause2_${id}:                          ; label for _clause2_${id}`);
      this._generateExpression(binop.expression_b);
      this.emit(` cmpl $0, %eax                      ; compare eax to 0
 movl $0, %eax                      ; move 0 into eax
 setne %al                          ; set al to 1 if not equal
_end_${id}:                              ; label for _end_${id}`);


    } else if (binop.binary_operator == ">")
    {
      this._generateExpression(binop.expression_a);
      this.emit(` pushq %rax                         ; push rax onto the stack`);
      this._generateExpression(binop.expression_b);
      this.emit(` popq %rcx                          ; pop stack into rcx
 cmpl %eax, %ecx                    ; compare eax and ecx
 movl $0, %eax                      ; move 0 into eax
 setg %al                           ; set al to 1 if greater`);

    } else if (binop.binary_operator == ",")
    {
      this._generateExpression(binop.expression_a);
      this._generateExpression(binop.expression_b);
    }
    else if (binop.binary_operator == "%")
    {
      this._generateExpression(binop.expression_a);
      this.emit(` pushq %rax                         ; push rax onto the stack`);
      this._generateExpression(binop.expression_b);
      this.emit(` movl %eax, %ebx                    ; move eax into ebx
 popq %rax                          ; pop stack into rax
 cltd                               ; sign-extend eax into edx:eax
 idivl %ebx                         ; divide edx:eax by ebx
 movl %edx, %eax                    ; move edx into eax (remainder)`);
    } else if (binop.binary_operator == "^")
    {
      this._generateExpression(binop.expression_a);
      this.emit(` pushq %rax                         ; push rax onto the stack`);
      this._generateExpression(binop.expression_b);
      this.emit(` popq %rcx                          ; pop stack into rcx
 xorl %ecx, %eax                    ; bitwise XOR ecx with eax`);
    } else if (binop.binary_operator == "|")
    {
      this._generateExpression(binop.expression_a);
      this.emit(` pushq %rax                         ; push rax onto the stack`);
      this._generateExpression(binop.expression_b);
      this.emit(` popq %rcx                          ; pop stack into rcx
 orl %ecx, %eax                     ; bitwise OR ecx with eax`);
    } else if (binop.binary_operator == "<<")
    {
      this._generateExpression(binop.expression_a);
      this.emit(` pushq %rax                         ; push rax onto the stack`);
      this._generateExpression(binop.expression_b);
      this.emit(` movl %eax, %ecx                    ; move eax into ecx
 popq %rax                          ; pop stack into rax
 sall %cl, %eax                     ; shift eax left by cl bits`);

    } else if (binop.binary_operator == ">>")
    {
      this._generateExpression(binop.expression_a);
      this.emit(` pushq %rax                         ; push rax onto the stack`);
      this._generateExpression(binop.expression_b);
      this.emit(` movl %eax, %ecx                    ; move eax into ecx
 popq %rax                          ; pop stack into rax
 sarl %cl, %eax                     ; arithmetic shift eax right by cl bits`);
    } else if (binop.binary_operator == "&")
    {
      this._generateExpression(binop.expression_a);
      this.emit(` pushq %rax                         ; push rax onto the stack`);
      this._generateExpression(binop.expression_b);
      this.emit(` popq %rcx                          ; pop stack into rcx
 andl %ecx, %eax                    ; bitwise AND ecx with eax`);
    } else if (binop.binary_operator == "<")
    {
      this._generateExpression(binop.expression_a);
      this.emit(` pushq %rax                         ; push rax onto the stack`);
      this._generateExpression(binop.expression_b);
      this.emit(` popq %rcx                          ; pop stack into rcx
 cmpl %eax, %ecx                    ; compare eax and ecx
 movl $0, %eax                      ; move 0 into eax
 setl %al                           ; set al to 1 if less`);

    } else if (compoundAssignments.includes(binop.binary_operator))
    {
      const varRef = binop.expression_a as VariableRef;
      const baseOp = binop.binary_operator.slice(0, -1);

      this._generateExpression(
        new Assign(varRef.str, new BinOp(baseOp, binop.expression_a, binop.expression_b))
      );
    } else
    {
      throw new Error(`Semantic Error: Unsupported binary operator '${binop.binary_operator}'`);
    }



  }

}