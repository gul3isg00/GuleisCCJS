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
import { Declare } from "./AST/constructs/types/declare";
import { VariableRef } from "./AST/constructs/types/variable_Ref";
import { Assign } from "./AST/constructs/types/assign";

const DEBUG_MODE = false;

export class Parser
{
  tokens: string[];
  current: number;

  constructor()
  {
    this.tokens = [];
    this.current = 0;
  }

  peek(): string
  {
    return this.tokens[this.current];
  }

  consume(): string
  {
    if (DEBUG_MODE) console.log(`Consuming ${this.tokens[this.current]}`);
    return this.tokens[this.current++];
  }

  parse(tokens: string[]): ASTNode
  {
    this.tokens = tokens;
    this.current = 0;

    // Start parsing. The root is always a 'Program'.
    return this._parseProgram();
  }

  expect(expected: string)
  {
    const token = this.peek();
    if (DEBUG_MODE) console.log(`Expecting ${token} === ${expected}`);
    if (token === expected)
    {
      if (DEBUG_MODE) console.log(` - MATCH, returning ${token}`)
      return this.consume();
    }
    throw new Error(`Syntax Error: Expected '${expected}' but got '${token}'`);
  }

  // <program> ::= <function>
  _parseProgram(): CProgram
  {
    const funcDec = this._parseFunction();
    return new Program(funcDec);
  }

  // <function> ::= "int" <id> "(" ")" "{" { <statement> } "}"
  _parseFunction(): CFunction
  {
    this.expect("int");

    const identifier = this.consume();

    this.expect("(");
    this.expect(")");
    this.expect("{");

    let next = this.peek();

    let statements: CStatement[] = []

    while (next != "}")
    {
      const statement = this._parseStatement();

      statements.push(statement);

      next = this.peek();
      if (next == null)
      {
        throw new Error(`Syntax Error: Expected: "}"`);
      }
    }

    this.expect("}");

    return new FunctionDeclaration(identifier, statements);
  }

  // <statement> ::= "return" <exp> ";"
  //             | <exp> ";"
  //             | "int" <id> [ = <exp>] ";" 
  _parseStatement(): CStatement
  {
    const token = this.consume()

    switch (token)
    {
      // Return statement.
      case ("return"):
        const retState = new ReturnStatement(this._parseExpression());
        this.expect(";");
        return retState;

      // Declaration of integer variable.
      case ("int"):
        const identifier = this.consume();
        let next = this.peek();

        if (next == ";")
        {
          return new Declare(identifier)
        } else
        {
          this.expect("=");
          const exp = this._parseExpression();
          this.expect(";")
          return new Declare(identifier, exp);
        }

      // Generic expression.
      default:
        const exp = this._parseExpression();
        this.expect(";")
        return exp;
    }
  }

  // Lower the line number, higher the precidence.
  // <exp> ::= <id> "=" <exp> | <logical-or-exp>
  _parseExpression(): CExpression
  {

    const left_exp = this._parseExpressionModular(() =>
    {
      return this._parseExpressionModular(() =>
      {
        return this._parseExpressionModular(() =>
        {
          return this._parseExpressionModular(() =>
          {
            return this._parseExpressionModular(() =>
            {
              return this._parseExpressionModular(() =>
              {
                return this._parseFactor()
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
      // <logical-or-exp> ::= <logical-and-exp> { "||" <logical-and-exp> } 
    }, ["||"])


    if (this.peek() == "=")
    {
      this.consume();
      return new Assign((left_exp as VariableRef).str, this._parseExpression());
    } else
    {
      return left_exp;
    }
  }

  // Lowest precidence expression
  _parseExpressionModular(_parse_method: () => CExpression, operators: string[]): CExpression
  {
    let expression = _parse_method()
    let next = this.peek();

    while (operators.indexOf(next) != -1)
    {
      let op = this.consume();
      let next_expression = _parse_method();
      expression = new BinOp(op, expression, next_expression);
      next = this.peek();
    }

    return expression;
  }

  // <factor> ::= "(" <exp> ")" | <unary_op> <factor> | <int> | <id>
  _parseFactor(): CExpression
  {
    const next = this.consume();

    // "(" <exp> ")"
    if (next == "(")
    {
      const exp = this._parseExpression()
      if (this.consume() != ")") throw new Error(`Syntax Error: ')' expected.`);
      return exp;
    }
    // <unary_op> <factor>
    else if (UnOp.is_unop(next))
    {
      const op = next;
      const factor = this._parseFactor();
      return new UnOp(op, factor);
    }
    // <int>
    else if (!isNaN(Number(next)))
    {
      return new Constant(Number(next))
    }
    // <id>
    else
    {
      return new VariableRef(next);
    }
  }
}
