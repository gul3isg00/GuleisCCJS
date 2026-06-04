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

  // Lower the line number, higher the precidence.
  parseExpression(): CExpression {
    return this.parseExpressionModular(() => {
      return this.parseExpressionModular(() => {
        return this.parseExpressionModular(() => {
          return this.parseExpressionModular(() => {
            return this.parseExpressionModular(() => {
              return this.parseExpressionModular(() => {
                return this.parseFactor()
              // <term> ::= <factor> { ("*" | "/") <factor> }
              }, ["*", "/"])
            // <additive-exp> ::= <term> { ("+" | "-") <term> }
            }, ["+", "-"])
          // <relational-exp> ::= <additive-exp> { ("<" | ">" | "<=" | ">=") <additive-exp> }
          }, ["<", ">", ">=", "<="])
        // <equality-exp> ::= <relational-exp> { ("!=" | "==") <relational-exp> }
        }, ["!=", "=="])
      // <logical-and-exp> ::= <equality-exp> { "&&" <equality-exp> }
      }, ["&&"])
    // <exp> ::= <logical-and-exp> { "||" <logical-and-exp> }
    }, ["||"])
  }

  // Lowest precidence expression
  parseExpressionModular(parse_method: () => CExpression, operators: string[]): CExpression {
    let expression = parse_method()
    let next = this.peek();

    while (operators.indexOf(next) != -1) {
      let op = this.consume();
      let next_expression = parse_method();
      expression = new BinOp(op, expression, next_expression);
      next = this.peek();
    }

    return expression;
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
