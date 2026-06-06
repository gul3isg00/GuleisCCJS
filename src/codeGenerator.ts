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
import { Assign } from "./AST/constructs/types/assign";
import { VariableRef } from "./AST/constructs/types/variable_Ref";

const NUM_OF_BYTES: number = 8;
const ESP: number = 0;

export class CodeGenerator
{
  save_location: string;
  variable_map: { [key: string]: number };
  stack_index: number = ESP - NUM_OF_BYTES;

  // To prevent a clash of identifiers in jumps
  label_counter: number = 0;

  constructor(save_location: string)
  {
    this.save_location = save_location.replace(".c", ".s");
    this.variable_map = {}
  }

  emit(input: string)
  {
    fs.appendFileSync(this.save_location, input);
  }

  generate(input: ASTNode)
  {
    fs.writeFileSync(this.save_location, "",);
    this._generateProgram(input as CProgram);
  }

  // ------------------ PROGRAM GENERATORS ---------------------------------

  _generateProgram(input: CProgram)
  {
    this._generateFunction(input.function_declaration as FunctionDeclaration);
  }

  // ------------------ FUNCTION GENERATORS ---------------------------------

  _generateFunction(input: CFunction)
  {
    // Function Prologue (Epilogue in return statement)
    this.emit(`.globl ${input.name}\n${input.name}:
 pushq %rbp
 movq %rsp, %rbp`);

    this._generateStatements(input.statements)

    let hasReturnStatement = false;

    // Main needs to return a 0.
    if (input.name = "main")
    {
      for (let x = 0; x != input.statements.length; x++)
      {
        if (input.statements[x] instanceof ReturnStatement)
        {
          hasReturnStatement = true;
          break;
        };
      }

      if (!hasReturnStatement)
      {
        this._generateStatements([new ReturnStatement(new Constant(0))]);
      }
    }
  }

  // ------------------ STATEMENT GENERATORS ---------------------------------

  _generateStatements(inputs: CStatement[])
  {
    inputs.forEach((input) =>
    {
      if (input instanceof ReturnStatement)
      {
        this._generateReturnStatement(input as ReturnStatement);
      } else if (input instanceof Declare)
      {
        this._generateDecalare(input as Declare)
      } else
      {
        this._generateExpression(input as CExpression)
      }
    })

  }

  _generateReturnStatement(retState: ReturnStatement)
  {
    this._generateExpression(retState.expression);
    // Function Epilogue
    this.emit(` movq %rbp, %rsp
 popq %rbp
 ret`);
  }

  _generateDecalare(dec: Declare)
  {
    if (this.variable_map[dec.str] != null)
    {
      throw new Error(`XYZ Error: Variable ${dec.str} defined more than once.`);
    }

    if (dec.expression)
    {
      this._generateExpression(dec.expression);
    } else
    {
      this._generateExpression(new Constant(0));
    }

    this.emit(` pushq %rax`);

    this.variable_map[dec.str] = this.stack_index;

    this.stack_index -= NUM_OF_BYTES;
  }

  // ------------------ EXPRESSION GENERATORS ---------------------------------

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
    }
    else
    {
      this._generateConstant(input as Constant);
    }
  }

  _generateAssign(ass: Assign)
  {
    this._generateExpression(ass.expression);
    const offset = this.variable_map[ass.str];
    this.emit(` movl %eax, ${offset}(%rbp)`)
  }

  _generateVariableRef(varRef: VariableRef)
  {
    const offset = this.variable_map[varRef.str];
    this.emit(` movl %eax, ${offset}(%rbp)`)
  }

  _generateUnOp(unop: UnOp)
  {
    this._generateExpression(unop.expression);

    if (unop.operator == "!")
    {
      this.emit(` cmpl $0, %eax
 sete %al
 movzbl %al, %eax`);
    } else if (unop.operator == "-")
    {
      this._generateExpression(unop.expression)
      this.emit(` neg %eax`);

    } else if (unop.operator == "++")
    {
      this._generateExpression(new BinOp("+=", unop.expression, new Constant(1)));
    } else if (unop.operator == "--")
    {
      this._generateExpression(new BinOp("-=", unop.expression, new Constant(1)));
    } else
    {
      this.emit(` not %eax`);
    }
  }

  _generateConstant(con: Constant)
  {
    this.emit(` movl \$${con.value.toString()}, %eax`);
  }

  _generateBinOp(binop: BinOp)
  {
    if (binop.binary_operator == "+")
    {
      this._generateExpression(binop.expression_a);
      this.emit(` pushq %rax`);
      this._generateExpression(binop.expression_b);
      this.emit(` popq %rcx
 addl %ecx, %eax`);

    } else if (binop.binary_operator == "-")
    {
      this._generateExpression(binop.expression_b);
      this.emit(` pushq %rax`);
      this._generateExpression(binop.expression_a);
      this.emit(` popq %rcx
 subl %ecx, %eax`);

    } else if (binop.binary_operator == "*")
    {
      this._generateExpression(binop.expression_a);
      this.emit(` pushq %rax`);
      this._generateExpression(binop.expression_b);
      this.emit(` popq %rcx
  imul %ecx, %eax`);

    } else if (binop.binary_operator == "/")
    {
      this._generateExpression(binop.expression_a);
      this.emit(` pushq %rax`);
      this._generateExpression(binop.expression_b);
      this.emit(` movl %eax, %ebx
 popq %rax
 cltd
 idivl %ebx`);

    } else if (binop.binary_operator == "==")
    {
      this._generateExpression(binop.expression_a);
      this.emit(` pushq %rax`);
      this._generateExpression(binop.expression_b);
      this.emit(` popq %rcx
 cmpl %eax, %ecx
 movl $0, %eax
 sete %al`);

    } else if (binop.binary_operator == "!=")
    {
      this._generateExpression(binop.expression_a);
      this.emit(` pushq %rax`);
      this._generateExpression(binop.expression_b);
      this.emit(` popq %rcx
 cmpl %eax, %ecx
 movl $0, %eax
 setne %al`);

    } else if (binop.binary_operator == "<=")
    {
      this._generateExpression(binop.expression_a);
      this.emit(` pushq %rax`);
      this._generateExpression(binop.expression_b);
      this.emit(` popq %rcx
 cmpl %eax, %ecx
 movl $0, %eax
 setle %al`);

    } else if (binop.binary_operator == ">=")
    {
      this._generateExpression(binop.expression_a);
      this.emit(` pushq %rax`);
      this._generateExpression(binop.expression_b);
      this.emit(` popq %rcx
 cmpl %eax, %ecx
 movl $0, %eax
 setge %al`);

    } else if (binop.binary_operator == "&&")
    {
      const id = this.label_counter++;
      this._generateExpression(binop.expression_a);
      this.emit(` cmpl $0, %eax
 jne _clause2_${id}
 jmp _end_${id}
_clause2_${id}:`);
      this._generateExpression(binop.expression_b);
      this.emit(` cmpl $0, %eax
 movl $0, %eax
 setne %al
_end_${id}: `);

    } else if (binop.binary_operator == "||")
    {
      const id = this.label_counter++;
      this._generateExpression(binop.expression_a);
      this.emit(` cmpl $0, %eax
 je _clause2_${id}
 movl $1, %eax
 jmp _end_${id}
_clause2_${id}:`);
      this._generateExpression(binop.expression_b);
      this.emit(` cmpl $0, %eax
 movl $0, %eax
 setne %al
_end_${id}: `);


    } else if (binop.binary_operator == ">")
    {
      this._generateExpression(binop.expression_a);
      this.emit(` pushq %rax`);
      this._generateExpression(binop.expression_b);
      this.emit(` popq %rcx
 cmpl %eax, %ecx
 movl $0, %eax
 setg %al`);

    } else if (binop.binary_operator == ",")
    {
      this._generateExpression(binop.expression_a);
      this._generateExpression(binop.expression_b);
    }
    // Same as divide but store the remainder not the quotient.
    else if (binop.binary_operator == "%")
    {
      this._generateExpression(binop.expression_a);
      this.emit(` pushq %rax`);
      this._generateExpression(binop.expression_b);
      this.emit(` movl %eax, %ebx
 popq %rax
 cltd
 idivl %ebx
 movl %edx, %eax`);
    } else if (binop.binary_operator == "^")
    {
      this._generateExpression(binop.expression_a);
      this.emit(` pushq %rax`);
      this._generateExpression(binop.expression_b);
      this.emit(` popq %rcx
 xorl %ecx, %eax`);
    } else if (binop.binary_operator == "|")
    {
      this._generateExpression(binop.expression_a);
      this.emit(` pushq %rax`);
      this._generateExpression(binop.expression_b);
      this.emit(` popq %rcx
 orl %ecx, %eax`);
    } else if (binop.binary_operator == "<<")
    {
      this._generateExpression(binop.expression_a);
      this.emit(` pushq %rax`);
      this._generateExpression(binop.expression_b);
      this.emit(` movl %eax, %ecx
 popq %rax
 sall %cl, %eax`);

    } else if (binop.binary_operator == ">>")
    {
      this._generateExpression(binop.expression_a);
      this.emit(` pushq %rax`);
      this._generateExpression(binop.expression_b);
      this.emit(` movl %eax, %ecx
 popq %rax
 sarl %cl, %eax`);
    } else if (binop.binary_operator == "&")
    {
      this._generateExpression(binop.expression_a);
      this.emit(` pushq %rax`);
      this._generateExpression(binop.expression_b);
      this.emit(` popq %rcx
 andl %ecx, %eax`);
    }

    // All the Operator + Assignment Ops (e.g. "<operator>=")
    else if (binop.binary_operator == "+=")
    {
      const varRef = binop.expression_a as VariableRef;
      this._generateExpression(new Assign(varRef.str, new BinOp("+", binop.expression_a, binop.expression_b)));
    } else if (binop.binary_operator == "-=")
    {
      const varRef = binop.expression_a as VariableRef;
      this._generateExpression(new Assign(varRef.str, new BinOp("-", binop.expression_a, binop.expression_b)));
    }
    else if (binop.binary_operator == "*=")
    {
      const varRef = binop.expression_a as VariableRef;
      this._generateExpression(new Assign(varRef.str, new BinOp("*", binop.expression_a, binop.expression_b)));
    } else if (binop.binary_operator == "/=")
    {
      const varRef = binop.expression_a as VariableRef;
      this._generateExpression(new Assign(varRef.str, new BinOp("/", binop.expression_a, binop.expression_b)));
    } else if (binop.binary_operator == "%=")
    {
      const varRef = binop.expression_a as VariableRef;
      this._generateExpression(new Assign(varRef.str, new BinOp("%", binop.expression_a, binop.expression_b)));
    } else if (binop.binary_operator == ">>=")
    {
      const varRef = binop.expression_a as VariableRef;
      this._generateExpression(new Assign(varRef.str, new BinOp(">>", binop.expression_a, binop.expression_b)));
    } else if (binop.binary_operator == "<<=")
    {
      const varRef = binop.expression_a as VariableRef;
      this._generateExpression(new Assign(varRef.str, new BinOp("<<", binop.expression_a, binop.expression_b)));
    } else if (binop.binary_operator == "&=")
    {
      const varRef = binop.expression_a as VariableRef;
      this._generateExpression(new Assign(varRef.str, new BinOp("&", binop.expression_a, binop.expression_b)));
    } else if (binop.binary_operator == "|=")
    {
      const varRef = binop.expression_a as VariableRef;
      this._generateExpression(new Assign(varRef.str, new BinOp("|", binop.expression_a, binop.expression_b)));
    } else if (binop.binary_operator == "^=")
    {
      const varRef = binop.expression_a as VariableRef;
      this._generateExpression(new Assign(varRef.str, new BinOp("^", binop.expression_a, binop.expression_b)));
    }
    // Less than
    else
    {
      this._generateExpression(binop.expression_a);
      this.emit(` pushq %rax`);
      this._generateExpression(binop.expression_b);
      this.emit(` popq %rcx
 cmpl %eax, %ecx
 movl $0, %eax
 setl %al`);

    }
  }

}
