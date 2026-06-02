import { ASTNode } from "./AST/ASTNode";
import { CFunction } from "./AST/constructs/cFunction";
import { CProgram } from "./AST/constructs/cProgram";
import { Constant } from "./AST/constructs/types/constant";
import { CExpression } from "./AST/constructs/cExpression";
import { FunctionDeclaration } from "./AST/constructs/types/functionDeclaration";
import { Program } from "./AST/constructs/types/program";
import { ReturnStatement } from "./AST/constructs/types/returnStatement";
import { CStatement } from "./AST/constructs/cStatement";
import { UnOp } from "./AST/constructs/types/unop";

export class Parser {
  tokens: string[];
  current: number;

  constructor() {
    this.tokens = [];
    this.current = 0;
  }

  peek(): string {
    return this.tokens[this.current];
  }

  consume(): string {
    return this.tokens[this.current++];
  }

  parse(tokens: string[]): ASTNode {
    this.tokens = tokens;
    this.current = 0;

    // Start parsing. The root is always a 'Program'.
    return this.parseProgram();
  }

  expect(expected: string) {
    const token = this.peek();
    if (token === expected) {
      return this.consume();
    }
    throw new Error(`Syntax Error: Expected '${expected}' but got '${token}'`);
  }

  parseProgram(): CProgram {
    const funcDec = this.parseFunction();
    return new Program(funcDec);
  }

  parseFunction(): CFunction {
    this.expect("int");

    const identifier = this.consume();

    this.expect("(");
    this.expect(")");
    this.expect("{");

    const statement = this.parseStatement();

    this.expect("}");
    return new FunctionDeclaration(identifier, statement);
  }

  parseStatement(): CStatement {
    this.expect("return");
    const retState = new ReturnStatement(this.parseExpression());
    this.expect(";");
    return retState;
  }

  parseExpression(): CExpression {
    const token = this.consume();
    const value = Number(token);

    if (isNaN(value)) {
      const expr = this.parseExpression();
      return new UnOp(token, expr);

    } else {
      return new Constant(value);
    }
  }
}
