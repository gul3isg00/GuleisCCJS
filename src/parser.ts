import { ASTNode } from "./AST/ASTNode";
import { Constant } from "./AST/constructs/constant";
import { FunctionDeclaration } from "./AST/constructs/functionDeclaration";
import { Program } from "./AST/constructs/program";
import { ReturnStatement } from "./AST/constructs/returnStatement";

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

  parseProgram(): Program {
    const funcDec = this.parseFunction();
    return new Program(funcDec);
  }

  parseFunction(): FunctionDeclaration {
    this.expect("int");

    const identifier = this.consume();

    this.expect("(");
    this.expect(")");
    this.expect("{");

    const statement = this.parseStatement();

    this.expect("}");
    return new FunctionDeclaration(identifier, statement);
  }

  parseStatement(): ReturnStatement {
    this.expect("return");
    const retState = new ReturnStatement(this.parseExpression());
    this.expect(";");
    return retState;
  }

  parseExpression(): Constant {
    const token = this.consume();
    const value = Number(token);

    if (isNaN(value)) {
      throw new Error(`Syntax Error: Expected Integer but got '${token}'`);
    }

    return new Constant(value);
  }
}
