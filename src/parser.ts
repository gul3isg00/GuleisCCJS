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
import { Conditional } from "./AST/constructs/types/conditional";
import { CDeclaration } from "./AST/constructs/cDeclaration";
import { CBlock } from "./AST/constructs/cBlock";
import { ConditionalExpression } from "./AST/constructs/types/conditionalExpression";

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

  // <function> ::= "int" <id> "(" ")" "{" { <block-item> } "}"
  _parseFunction(): CFunction
  {
    this.expect("int");

    const identifier = this.consume();

    this.expect("(");
    this.expect(")");
    this.expect("{");

    let next = this.peek();

    let blocks: CStatement[] = []

    while (next != "}")
    {
      const block = this._parseBlock();

      blocks.push(block);

      next = this.peek();
      if (next == null)
      {
        throw new Error(`Syntax Error: Expected: "}"`);
      }
    }

    this.expect("}");

    return new FunctionDeclaration(identifier, blocks);
  }

  // <statement>  ::= "return" <exp> ";"
  // | <exp> ";"
  // | "if" "(" <exp> ")" <statement> [ "else" <statement> ]
  _parseStatement(): CStatement
  {
    const token = this.peek()

    switch (token)
    {
      // Return statement.
      case ("return"):
        this.consume();
        const retState = new ReturnStatement(this._parseExpression());
        this.expect(";");
        return retState;

      // Conditinal
      case ("if"):
        this.consume();
        this.expect("(")

        const cond_exp = this._parseExpression();

        this.expect(")")

        const cond_statement = this._parseStatement()

        if (this.peek() == "else")
        {
          this.consume();
          return new Conditional(cond_exp, cond_statement, this._parseStatement());
        } else
        {
          return new Conditional(cond_exp, cond_statement);
        }

      // Generic expression.
      default:
        const exp = this._parseExpression();
        this.expect(";")
        return exp;
    }
  }

  // <declaration> ::= "int" <id> [ = <exp> ] ";"
  _parseDeclaration(): CDeclaration
  {
    this.expect("int");

    const varRef = this._parseExpression() as VariableRef;

    if (varRef == null)
    {
      throw new Error(`Syntax Error: Expected identifier.`);
    }

    const next = this.peek();

    if (next == "=")
    {
      this.consume();

      const value = this._parseExpression();

      this.expect(";");

      return new Declare(varRef.str, value);
    } else
    {
      this.expect(";");

      return new Declare(varRef.str);
    }
  }

  //<block-item> ::= <statement> | <declaration>
  _parseBlock(): CBlock
  {
    const next = this.peek();

    if (next == "int")
    {
      return this._parseDeclaration();
    } else
    {
      return this._parseStatement();
    }
  }

  // Lower the line number, higher the precidence.
  // <exp> ::= <id> "=" <exp> | <conditional-exp>
  _parseExpression(): CExpression
  {
    const left_exp = this._parseConditionalExpression();

    // Create assignment blocks.
    const assignOps = ["=", "+=", "-=", "*=", "/=", "%=", ">>=", "<<=", "&=", "|=", "^="];
    const nextOp = this.peek();

    if (assignOps.indexOf(nextOp) != -1)
    {
      this.consume();

      const right_exp = this._parseExpression();

      if (nextOp == "=")
      {
        return new Assign((left_exp as VariableRef).str, right_exp);
      } else
      {
        return new BinOp(nextOp, left_exp, right_exp);
      }
    } else
    {
      return left_exp;
    }
  }

  _parseConditionalExpression(): CExpression
  {
    const exp = this._parseExpressionModular(() =>
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
                return this._parseExpressionModular(() =>
                {
                  return this._parseExpressionModular(() =>
                  {
                    return this._parseExpressionModular(() =>
                    {
                      return this._parseExpressionModular(() =>
                      {
                        return this._parseFactor()
                        // <term> ::= <factor> { ("*" | "/" | "%") <factor> }
                      }, ["*", "/", "%"])
                      // <additive-exp> ::= <term> { ("+" | "-") <term> }
                    }, ["+", "-"])
                    // <bitwise-exp> ::= <additive-exp> { ("<<" | ">>") <additive-exp> }
                  }, ["<<", ">>"])
                  // <relational-exp> ::= <bitwise-exp> { ("<" | ">" | "<=" | ">=") <bitwise-exp> }
                }, ["<", ">", ">=", "<="])
                // <equality-exp> ::= Drelational-exp> { ("!=" | "==") <relational-exp> }
              }, ["!=", "=="])
              // <bitwise-and-exp> ::= <equality-exp> { "&" <equality-exp> }
            }, ["&"])
            // <bitwise-xor-exp> ::= <bitwise-and-exp> { "^" <bitwise-and-exp> }
          }, ["^"]);
          // <bitwise-or-exp> ::= <bitwise-xor-exp> { "|" <bitwise-xor-exp> }
        }, ["|"])
        // <logical-and-exp> ::= <equality-exp> { "&&" <equality-exp> }
      }, ["&&"])
      // <logical-or-exp> ::= <logical-and-exp> { "||" <logical-and-exp> } 
    }, ["||"]);

    if (this.peek() == "?")
    {
      this.consume();

      const exp_b = this._parseExpression();

      this.expect(":");

      const exp_c = this._parseConditionalExpression();

      return new ConditionalExpression(exp, exp_b, exp_c);
    } else
    {
      return exp
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
    let parsedFactor: CExpression;

    // "(" <exp> ")"
    if (next == "(")
    {
      const exp = this._parseExpression()
      if (this.consume() != ")") throw new Error(`Syntax Error: ')' expected.`);
      parsedFactor = exp;
    }

    // PREFIX

    // <unary_op> <factor>
    else if (UnOp.is_unop(next))
    {
      const op = next;
      const factor = this._parseFactor();
      parsedFactor = new UnOp(op, factor);
    }
    // <int>
    else if (!isNaN(Number(next)))
    {
      parsedFactor = new Constant(Number(next))
    }
    // <id>
    else
    {
      parsedFactor = new VariableRef(next);
    }

    // POSTFIX

    const next_2 = this.peek();
    if (next_2 == "++" || next_2 == "--")
    {
      const op = this.consume();
      parsedFactor = new UnOp(op, parsedFactor);
    }

    return parsedFactor;
  }
}
