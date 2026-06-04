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
import { BinOp } from "./AST/constructs/types/binOp";

const DEBUG_MODE = false;

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
    if (DEBUG_MODE) console.log(`Consuming ${this.tokens[this.current]}`);
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
    if (DEBUG_MODE) console.log(`Expecting ${token} === ${expected}`);
    if (token === expected) {
      if (DEBUG_MODE) console.log(` - MATCH, returning ${token}`)
      return this.consume();
    }
    throw new Error(`Syntax Error: Expected '${expected}' but got '${token}'`);
  }

  // <program> ::= <function>
  parseProgram(): CProgram {
    const funcDec = this.parseFunction();
    return new Program(funcDec);
  }

  // <function> ::= "int" <id> "(" ")" "{" <statement> "}"
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

  // <statement> ::= "return" <exp> ";"
  parseStatement(): CStatement {
    this.expect("return");
    const retState = new ReturnStatement(this.parseExpression());
    this.expect(";");
    return retState;
  }

  // <exp> ::= <logical-and-exp> { "||" <logical-and-exp> }
  parseExpression(): CExpression {
    let loe = this.parseLogicalAndExpression();
    let next = this.peek();

    while (next == "||") {
      let op = this.consume();
      let next_loe = this.parseLogicalAndExpression();
      loe = new BinOp(op, loe, next_loe);
      next = this.peek();
    }

    return loe;
  }

  // <logical-and-exp> ::= <equality-exp> { "&&" <equality-exp> }
  parseLogicalAndExpression(): CExpression {
    let eexp = this.parseEqualityExpression();
    let next = this.peek();

    while (next == "&&") {
      let op = this.consume();
      let next_eexp = this.parseLogicalAndExpression();
      eexp = new BinOp(op, eexp, next_eexp);
      next = this.peek();
    }

    return eexp;
  }

  // <equality-exp> ::= <relational-exp> { ("!=" | "==") <relational-exp> }
  parseEqualityExpression(): CExpression {
    let rexp = this.parseRelationalExpression();
    let next = this.peek();

    while (next == "!=" || next == "==") {
      let op = this.consume();
      let next_rexp = this.parseRelationalExpression();
      rexp = new BinOp(op, rexp, next_rexp);
      next = this.peek();
    }

    return rexp;
  }

  // <relational-exp> ::= <additive-exp> { ("<" | ">" | "<=" | ">=") <additive-exp> }
  parseRelationalExpression(): CExpression {
    let add_exp = this.parseAdditiveExpression();
    let next = this.peek();

    while (next == "<" || next == ">" || next == "<=" || next == ">=") {
      let op = this.consume();
      let next_add_exp = this.parseAdditiveExpression();
      add_exp = new BinOp(op, add_exp, next_add_exp);
      next = this.peek();
    }

    return add_exp;
  }

  // <additive-exp> ::= <term> { ("+" | "-") <term> }
  parseAdditiveExpression(): CExpression {
    let term = this.parseTerm();
    let next = this.peek();

    while (next == "<" || next == ">" || next == "<=" || next == ">=") {
      let op = this.consume();
      let next_term = this.parseTerm();
      term = new BinOp(op, term, next_term);
      next = this.peek();
    }

    return term;
  }

  // <term> ::= <factor> { ("*" | "/") <factor> }
  parseTerm(): CExpression {
    let factor = this.parseFactor();
    let next = this.peek();

    while (next == "*" || next == "/") {
      let op = this.consume();
      let next_factor = this.parseFactor();
      factor = new BinOp(op, factor, next_factor);
      next = this.peek();
    }

    return factor;
  }

  // <factor> ::= "(" <exp> ")" | <unary_op> <factor> | <int
  parseFactor(): CExpression {
    const next = this.consume();

    // "(" <exp> ")"
    if (next == "(") {
      const exp = this.parseExpression()
      if (this.consume() != ")") throw new Error(`Syntax Error: ')' expected.`);
      return exp;
    }
    // <unary_op> <factor>
    else if (UnOp.is_unop(next)) {
      const op = next;
      const factor = this.parseFactor();
      return new UnOp(op, factor);
    }
    // <int>
    else if (!isNaN(Number(next))) {
      return new Constant(Number(next))
    }
    else {
      throw new Error(`Syntax Error: Expected return value.`)
    }
  }

}
