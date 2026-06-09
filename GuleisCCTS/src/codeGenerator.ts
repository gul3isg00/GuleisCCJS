import { ASTNode } from "./AST/ASTNode";
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
import { Compound } from "./AST/constructs/types/compound";
import { Exp } from "./AST/constructs/types/exp";
import { For } from "./AST/constructs/types/for";
import { ForDeclaration } from "./AST/constructs/types/forDeclaration";
import { While } from "./AST/constructs/types/while";
import { Do } from "./AST/constructs/types/do";
import { Break } from "./AST/constructs/types/break";
import { Continue } from "./AST/constructs/types/continue";
import { FunctionCall } from "./AST/constructs/types/functionCall";

const NUM_OF_BYTES: number = 8;
const ESP: number = 0;

const argRegisters = ["%rdi", "%rsi", "%rdx", "%rcx", "%r8", "%r9"];

class VariableMap {
  private scopes: { [key: string]: number }[] = [{}];
  private currentStackIndex: number = ESP - NUM_OF_BYTES;

  enterFunction() {
    this.scopes = [this.scopes[0], {}];
    this.currentStackIndex = ESP - NUM_OF_BYTES;
  }

  exitFunction() {
    this.scopes = [this.scopes[0]];
  }

  enterScope() {
    this.scopes.push({});
  }

  exitScope() {
    this.scopes.pop();
  }

  addVariable(name: string): number {
    const currentScope = this.scopes[this.scopes.length - 1];
    currentScope[name] = this.currentStackIndex;
    this.currentStackIndex -= NUM_OF_BYTES;
    return currentScope[name];
  }

  lookup(name: string): number {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (name in this.scopes[i]) {
        return this.scopes[i][name];
      }
    }
    return 0;
  }
}

// Lets try and build this.
export abstract class CodeGenerator {
  label_counter: number = 0;
  variable_map: VariableMap;
  loop_stack: number[] = [];
  current_function: string = "";

  constructor() {
    this.variable_map = new VariableMap();
  }

  abstract emit(input: string): void;

  abstract generate(input: ASTNode): string;

  _generateProgram(input: CProgram) {
    input.items.forEach((i) => {
      if (i instanceof FunctionDeclaration) {
        this.variable_map = new VariableMap();
        this.loop_stack = [];
        this._generateFunction(i);
      } else {
        this._generateDeclaration(i);
      }
    });
  }

  _generateFunction(input: CFunction) {
    if (input.blocks === undefined) return;

    this
      .emit(`.globl ${input.name}                 ; make ${input.name} visible to linker
${input.name}:                              ; label for ${input.name}
 pushq %rbp                         ; save base pointer
 movq %rsp, %rbp                    ; set base pointer to stack pointer`);

    this.variable_map.enterFunction();

    if (input.params && input.params.length > 0) {
      if (input.params.length > 6) {
        throw new Error(
          "Compiler Error: More than 6 parameters not yet supported."
        );
      }

      for (let i = 0; i < input.params.length; i++) {
        const paramName = input.params[i];
        const offset = this.variable_map.addVariable(paramName);

        this.emit(
          ` movq ${argRegisters[i]}, ${offset}(%rbp)                              ; save param ${paramName}`
        );
      }
    }

    this._generateBlocks(input.blocks);

    let hasReturnStatement = false;

    if (input.name == "main") {
      for (let x = input.blocks.length - 1; x >= 0; x--) {
        if (input.blocks[x] instanceof ReturnStatement) {
          hasReturnStatement = true;
          break;
        }
      }

      if (!hasReturnStatement) {
        this._generateStatement(new ReturnStatement(new Constant(0)));
      }
    }

    this.variable_map.exitFunction();
  }

  _generateBlocks(inputs: CBlock[]) {
    inputs.forEach((input) => {
      if (input instanceof Declare) {
        this._generateDeclaration(input);
      } else {
        this._generateStatement(input);
      }
    });
  }

  _generateStatement(input: CStatement) {
    if (input instanceof ReturnStatement) {
      this._generateReturnStatement(input as ReturnStatement);
    } else if (input instanceof Exp) {
      const exp = input as Exp;
      if (exp.expression != null) {
        this._generateExpression(exp.expression);
      }
    } else if (input instanceof Conditional) {
      this._generateConditional(input as Conditional);
    } else if (input instanceof Compound) {
      this._generateCompound(input as Compound);
    } else if (input instanceof For) {
      this._generateFor(input as For);
    } else if (input instanceof ForDeclaration) {
      this._generateForDecl(input as ForDeclaration);
    } else if (input instanceof While) {
      this._generateWhile(input as While);
    } else if (input instanceof Do) {
      this._generateDo(input as Do);
    } else if (input instanceof Break) {
      this._generateBreak();
    } else if (input instanceof Continue) {
      this._generateContinue();
    } else {
      this._generateExpression(input as CExpression);
    }
  }

  _generateWhile(whi: While) {
    const loopId = this.label_counter++;
    this.loop_stack.push(loopId);

    this.emit(`loop_start_${loopId}:                   ; label for while loop`);
    this.emit(`loop_continue_${loopId}:                ; continue`);

    this._generateExpression(whi.expression);

    this.emit(` testb %al, %al                  ; test the condition
 je loop_exit_${loopId}                  ; exit the loop if condition is met`);

    this._generateStatement(whi.statement);

    this.emit(
      ` jmp loop_start_${loopId}                  ; jump to loop start`
    );
    this.emit(`loop_exit_${loopId}:                  ; exit the loop`);

    this.loop_stack.pop();
  }

  _generateDo(doo: Do) {
    const loopId = this.label_counter++;
    this.loop_stack.push(loopId);

    this.emit(
      `loop_start_${loopId}:                   ; label for do while loop`
    );

    this._generateStatement(doo.statement);

    this.emit(
      `loop_continue_${loopId}:                ; continue goes to condition check`
    );

    this._generateExpression(doo.expression);

    this.emit(` testb %al, %al                  ; test the condition
 je loop_exit_${loopId}                  ; exit the loop if condition is met`);

    this.emit(
      ` jmp loop_start_${loopId}                  ; jump to loop start`
    );
    this.emit(`loop_exit_${loopId}:                  ; exit the loop`);

    this.loop_stack.pop();
  }

  _generateCompound(comp: Compound) {
    this.variable_map.enterScope();
    this._generateBlocks(comp.blocks);
    this.variable_map.exitScope();
  }

  _generateReturnStatement(retState: ReturnStatement) {
    this._generateExpression(retState.expression);
    this.emit(` movq %rbp, %rsp                  ; restore stack pointer
 popq %rbp                          ; restore base pointer
 ret                                ; return from function`);
  }

  _generateFor(frStat: For) {
    const loopId = this.label_counter++;

    this._generateStatement(frStat.initial_exp);

    this.loop_stack.push(loopId);

    this.emit(`loop_start_${loopId}:                   ; label for for loop`);

    this._generateExpression(frStat.condition);

    this.emit(` testb %al, %al                  ; test the condition
 je loop_exit_${loopId}                  ; exit the loop if condition is met`);

    this._generateStatement(frStat.body);

    this.emit(`loop_continue_${loopId}:                  ; label for continue`);

    this._generateStatement(frStat.post_exp);

    this.emit(
      ` jmp loop_start_${loopId}                  ; jump to loop start`
    );
    this.emit(`loop_exit_${loopId}:                  ; exit the loop`);

    this.loop_stack.pop();
  }

  _generateForDecl(frDecl: ForDeclaration) {
    const loopId = this.label_counter++;

    this.variable_map.enterScope();

    this._generateDeclaration(frDecl.initial_declaration);

    this.loop_stack.push(loopId);

    this.emit(`loop_start_${loopId}:                   ; label for for loop`);

    this._generateExpression(frDecl.condition);

    this.emit(` testb %al, %al                  ; test the condition
 je loop_exit_${loopId}                  ; exit the loop if condition is met`);

    this._generateStatement(frDecl.body);

    this.emit(`loop_continue_${loopId}:                  ; label for continue`);

    this._generateStatement(frDecl.post_exp);

    this.emit(
      ` jmp loop_start_${loopId}                  ; jump to loop start`
    );
    this.emit(`loop_exit_${loopId}:                  ; exit the loop`);

    this.loop_stack.pop();
    this.variable_map.exitScope();
  }

  _generateBreak() {
    const currentLoopId = this.loop_stack[this.loop_stack.length - 1];
    this.emit(
      ` jmp loop_exit_${currentLoopId}                  ; break the loop`
    );
  }

  _generateContinue() {
    const currentLoopId = this.loop_stack[this.loop_stack.length - 1];
    this.emit(
      ` jmp loop_continue_${currentLoopId}                  ; continue to next item`
    );
  }

  _generateConditional(cond: Conditional) {
    const id = this.label_counter++;
    this._generateExpression(cond.expression);
    this.emit(` cmpl $0, %rax                      ; compare eax to 0
 je _cond_${id}                         ; jump if equal to _cond_${id}`);

    this._generateStatement(cond.if_statement);

    this
      .emit(` jmp _post_conditional_${id}            ; jump unconditionally to _post_conditional_${id}
_cond_${id}:                             ; label for _cond_${id}`);

    if (cond.else_statement != null) {
      this._generateStatement(cond.else_statement);
    }
    this.emit(
      `_post_conditional_${id}:                 ; label for _post_conditional_${id}`
    );
  }

  _generateDeclaration(input: CDeclaration) {
    this._generateDeclare(input);
  }

  _generateDeclare(dec: Declare) {
    this.variable_map.addVariable(dec.str);

    if (dec.expression) {
      this._generateExpression(dec.expression);
    } else {
      this._generateExpression(new Constant(0));
    }

    this.emit(` pushq %rax                         ; push rax onto the stack`);
  }

  _generateExpression(input: CExpression) {
    if (input instanceof UnOp) {
      this._generateUnOp(input as UnOp);
    } else if (input instanceof Assign) {
      this._generateAssign(input as Assign);
    } else if (input instanceof VariableRef) {
      this._generateVariableRef(input as VariableRef);
    } else if (input instanceof BinOp) {
      this._generateBinOp(input as BinOp);
    } else if (input instanceof ConditionalExpression) {
      this._generateConditionalExpression(input as ConditionalExpression);
    } else if (input instanceof FunctionCall) {
      this._generateFunctionCall(input as FunctionCall);
    } else {
      this._generateConstant(input as Constant);
    }
  }

  _generateConditionalExpression(cond: ConditionalExpression) {
    const id = this.label_counter++;
    this._generateExpression(cond.condition);
    this.emit(` cmpl $0, %rax                      ; compare eax to 0
 je _cond_${id}                         ; jump if equal to _cond_${id}`);
    this._generateExpression(cond.if_statement);
    this
      .emit(` jmp _post_conditional_${id}            ; jump unconditionally to _post_conditional_${id}
_cond_${id}:                             ; label for _cond_${id}`);
    this._generateExpression(cond.else_statement);
    this.emit(
      `_post_conditional_${id}:                 ; label for _post_conditional_${id}`
    );
  }

  _generateAssign(ass: Assign) {
    this._generateExpression(ass.expression);
    const offset = this.variable_map.lookup(ass.str);
    this.emit(
      ` movl %rax, ${offset}(%rbp)                ; move eax into local variable at offset ${offset}`
    );
  }

  _generateVariableRef(varRef: VariableRef) {
    const offset = this.variable_map.lookup(varRef.str);
    this.emit(
      ` movl ${offset}(%rbp), %rax                ; move local variable at offset ${offset} into eax`
    );
  }

  _generateUnOp(unop: UnOp) {
    this._generateExpression(unop.expression);

    if (unop.operator == "!") {
      this.emit(` cmpl $0, %rax                      ; compare eax to 0
 sete %al                           ; set al to 1 if equal, 0 otherwise
 movzbl %al, %rax                   ; zero-extend al to eax`);
    } else if (unop.operator == "-") {
      this._generateExpression(unop.expression);
      this.emit(
        ` neg %rax                           ; negate eax (two's complement)`
      );
    } else if (unop.operator == "++") {
      this._generateExpression(
        new BinOp("+=", unop.expression, new Constant(1))
      );
    } else if (unop.operator == "--") {
      this._generateExpression(
        new BinOp("-=", unop.expression, new Constant(1))
      );
    } else {
      this.emit(` not %rax                           ; bitwise NOT on eax`);
    }
  }

  _generateFunctionCall(fc: FunctionCall) {
    fc.params.forEach((p) => {
      this._generateExpression(p);
      this.emit(
        ` pushq %rax                           ; push param onto stack`
      );
    });

    let cur_reg = fc.params.length - 1;

    for (let i = 0; i < fc.params.length; i++) {
      this.emit(
        ` popq ${argRegisters[cur_reg]}                           ; pop into ${argRegisters[cur_reg]}`
      );
      cur_reg--;
    }

    this.emit(
      ` xorq %rax, %rax                        ; clear al to 0 for variadic functions`
    );
    this.emit(` call ${fc.name}`);
  }

  _generateConstant(con: Constant) {
    this.emit(
      ` movl \$${con.value.toString()}, %rax                ; move constant ${con.value.toString()} into eax`
    );
  }

  _generateBinOp(binop: BinOp) {
    const compoundAssignments = [
      "+=",
      "-=",
      "*=",
      "/=",
      "%=",
      ">>=",
      "<<=",
      "&=",
      "|=",
      "^=",
    ];

    if (binop.binary_operator == "+") {
      this._generateExpression(binop.expression_a);
      this.emit(
        ` pushq %rax                         ; push rax onto the stack`
      );
      this._generateExpression(binop.expression_b);
      this.emit(` popq %rcx                          ; pop stack into rcx
 addl %rcx, %rax                    ; add ecx to eax`);
    } else if (binop.binary_operator == "-") {
      this._generateExpression(binop.expression_b);
      this.emit(
        ` pushq %rax                         ; push rax onto the stack`
      );
      this._generateExpression(binop.expression_a);
      this.emit(` popq %rcx                          ; pop stack into rcx
 subl %rcx, %rax                    ; subtract ecx from eax`);
    } else if (binop.binary_operator == "*") {
      this._generateExpression(binop.expression_a);
      this.emit(
        ` pushq %rax                         ; push rax onto the stack`
      );
      this._generateExpression(binop.expression_b);
      this.emit(` popq %rcx                          ; pop stack into rcx
 imul %rcx, %rax                    ; multiply eax by ecx`);
    } else if (binop.binary_operator == "/") {
      this._generateExpression(binop.expression_a);
      this.emit(
        ` pushq %rax                         ; push rax onto the stack`
      );
      this._generateExpression(binop.expression_b);
      this.emit(` movl %rax, %rbx                    ; move eax into ebx
 popq %rax                          ; pop stack into rax
 cltd                               ; sign-extend eax into edx:eax
 idivl %rbx                         ; divide edx:eax by ebx`);
    } else if (binop.binary_operator == "==") {
      this._generateExpression(binop.expression_a);
      this.emit(
        ` pushq %rax                         ; push rax onto the stack`
      );
      this._generateExpression(binop.expression_b);
      this.emit(` popq %rcx                          ; pop stack into rcx
 cmpl %rax, %rcx                    ; compare eax and ecx
 movl $0, %rax                      ; move 0 into eax
 sete %al                           ; set al to 1 if equal`);
    } else if (binop.binary_operator == "!=") {
      this._generateExpression(binop.expression_a);
      this.emit(
        ` pushq %rax                         ; push rax onto the stack`
      );
      this._generateExpression(binop.expression_b);
      this.emit(` popq %rcx                          ; pop stack into rcx
 cmpl %rax, %rcx                    ; compare eax and ecx
 movl $0, %rax                      ; move 0 into eax
 setne %al                          ; set al to 1 if not equal`);
    } else if (binop.binary_operator == "<=") {
      this._generateExpression(binop.expression_a);
      this.emit(
        ` pushq %rax                         ; push rax onto the stack`
      );
      this._generateExpression(binop.expression_b);
      this.emit(` popq %rcx                          ; pop stack into rcx
 cmpl %rax, %rcx                    ; compare eax and ecx
 movl $0, %rax                      ; move 0 into eax
 setle %al                          ; set al to 1 if less or equal`);
    } else if (binop.binary_operator == ">=") {
      this._generateExpression(binop.expression_a);
      this.emit(
        ` pushq %rax                         ; push rax onto the stack`
      );
      this._generateExpression(binop.expression_b);
      this.emit(` popq %rcx                          ; pop stack into rcx
 cmpl %rax, %rcx                    ; compare eax and ecx
 movl $0, %rax                      ; move 0 into eax
 setge %al                          ; set al to 1 if greater or equal`);
    } else if (binop.binary_operator == "&&") {
      const id = this.label_counter++;
      this._generateExpression(binop.expression_a);
      this.emit(` cmpl $0, %rax                      ; compare eax to 0
 jne _clause2_${id}                     ; jump if not equal to _clause2_${id}
 jmp _end_${id}                         ; jump unconditionally to _end_${id}
_clause2_${id}:                          ; label for _clause2_${id}`);
      this._generateExpression(binop.expression_b);
      this.emit(` cmpl $0, %rax                      ; compare eax to 0
 movl $0, %rax                      ; move 0 into eax
 setne %al                          ; set al to 1 if not equal
_end_${id}:                              ; label for _end_${id}`);
    } else if (binop.binary_operator == "||") {
      const id = this.label_counter++;
      this._generateExpression(binop.expression_a);
      this.emit(` cmpl $0, %rax                      ; compare eax to 0
 je _clause2_${id}                      ; jump if equal to _clause2_${id}
 movl $1, %rax                      ; move 1 into eax
 jmp _end_${id}                         ; jump unconditionally to _end_${id}
_clause2_${id}:                          ; label for _clause2_${id}`);
      this._generateExpression(binop.expression_b);
      this.emit(` cmpl $0, %rax                      ; compare eax to 0
 movl $0, %rax                      ; move 0 into eax
 setne %al                          ; set al to 1 if not equal
_end_${id}:                              ; label for _end_${id}`);
    } else if (binop.binary_operator == ">") {
      this._generateExpression(binop.expression_a);
      this.emit(
        ` pushq %rax                         ; push rax onto the stack`
      );
      this._generateExpression(binop.expression_b);
      this.emit(` popq %rcx                          ; pop stack into rcx
 cmpl %rax, %rcx                    ; compare eax and ecx
 movl $0, %rax                      ; move 0 into eax
 setg %al                           ; set al to 1 if greater`);
    } else if (binop.binary_operator == ",") {
      this._generateExpression(binop.expression_a);
      this._generateExpression(binop.expression_b);
    } else if (binop.binary_operator == "%") {
      this._generateExpression(binop.expression_a);
      this.emit(
        ` pushq %rax                         ; push rax onto the stack`
      );
      this._generateExpression(binop.expression_b);
      this.emit(` movl %rax, %rbx                    ; move eax into ebx
 popq %rax                          ; pop stack into rax
 cltd                               ; sign-extend eax into edx:eax
 idivl %rbx                         ; divide edx:eax by ebx
 movl %rdx, %rax                    ; move edx into eax (remainder)`);
    } else if (binop.binary_operator == "^") {
      this._generateExpression(binop.expression_a);
      this.emit(
        ` pushq %rax                         ; push rax onto the stack`
      );
      this._generateExpression(binop.expression_b);
      this.emit(` popq %rcx                          ; pop stack into rcx
 xorl %rcx, %rax                    ; bitwise XOR ecx with eax`);
    } else if (binop.binary_operator == "|") {
      this._generateExpression(binop.expression_a);
      this.emit(
        ` pushq %rax                         ; push rax onto the stack`
      );
      this._generateExpression(binop.expression_b);
      this.emit(` popq %rcx                          ; pop stack into rcx
 orl %rcx, %rax                     ; bitwise OR ecx with eax`);
    } else if (binop.binary_operator == "<<") {
      this._generateExpression(binop.expression_a);
      this.emit(
        ` pushq %rax                         ; push rax onto the stack`
      );
      this._generateExpression(binop.expression_b);
      this.emit(` movl %rax, %rcx                    ; move eax into ecx
 popq %rax                          ; pop stack into rax
 sall %cl, %rax                     ; shift eax left by cl bits`);
    } else if (binop.binary_operator == ">>") {
      this._generateExpression(binop.expression_a);
      this.emit(
        ` pushq %rax                         ; push rax onto the stack`
      );
      this._generateExpression(binop.expression_b);
      this.emit(` movl %rax, %rcx                    ; move eax into ecx
 popq %rax                          ; pop stack into rax
 sarl %cl, %rax                     ; arithmetic shift eax right by cl bits`);
    } else if (binop.binary_operator == "&") {
      this._generateExpression(binop.expression_a);
      this.emit(
        ` pushq %rax                         ; push rax onto the stack`
      );
      this._generateExpression(binop.expression_b);
      this.emit(` popq %rcx                          ; pop stack into rcx
 andl %rcx, %rax                    ; bitwise AND ecx with eax`);
    } else if (binop.binary_operator == "<") {
      this._generateExpression(binop.expression_a);
      this.emit(
        ` pushq %rax                         ; push rax onto the stack`
      );
      this._generateExpression(binop.expression_b);
      this.emit(` popq %rcx                          ; pop stack into rcx
 cmpl %rax, %rcx                    ; compare eax and ecx
 movl $0, %rax                      ; move 0 into eax
 setl %al                           ; set al to 1 if less`);
    } else if (compoundAssignments.includes(binop.binary_operator)) {
      const varRef = binop.expression_a as VariableRef;
      const baseOp = binop.binary_operator.slice(0, -1);

      this._generateExpression(
        new Assign(
          varRef.str,
          new BinOp(baseOp, binop.expression_a, binop.expression_b)
        )
      );
    } else {
      throw new Error(
        `Compiler Error: Unsupported binary operator '${binop.binary_operator}'`
      );
    }
  }
}
