import { ASTNode } from "./ast/ASTNode";
import { CBlockItem } from "./ast/constructs/cBlockItem";
import { CDeclaration } from "./ast/constructs/cDeclaration";
import { CExpression } from "./ast/constructs/cExpression";
import { CFunction } from "./ast/constructs/cFunction";
import { CProgram } from "./ast/constructs/cProgram";
import { CStatement } from "./ast/constructs/cStatement";
import { CSpecifier } from "./ast/constructs/cSpecifier";
import { CType } from "./ast/constructs/cType";
import { Program } from "./ast/constructs/nodes/core/program";
import { VariableDeclaration } from "./ast/constructs/nodes/declarations/variableDeclaration";
import { ForDeclaration } from "./ast/constructs/nodes/declarations/forDeclaration";
import { FunctionDeclaration } from "./ast/constructs/nodes/declarations/functionDeclaration";
import { Assign } from "./ast/constructs/nodes/expressions/assign";
import { BinOp } from "./ast/constructs/nodes/expressions/binOp";
import { ConditionalExpression } from "./ast/constructs/nodes/expressions/conditionalExpression";
import { Exp } from "./ast/constructs/nodes/expressions/exp";
import { FunctionCall } from "./ast/constructs/nodes/expressions/functionCall";
import { UnOp } from "./ast/constructs/nodes/expressions/unop";
import { VariableRef } from "./ast/constructs/nodes/expressions/variableRef";
import { Break } from "./ast/constructs/nodes/statements/break";
import { Compound } from "./ast/constructs/nodes/statements/compound";
import { Conditional } from "./ast/constructs/nodes/statements/conditional";
import { Continue } from "./ast/constructs/nodes/statements/continue";
import { Do } from "./ast/constructs/nodes/statements/do";
import { For } from "./ast/constructs/nodes/statements/for";
import { ReturnStatement } from "./ast/constructs/nodes/statements/returnStatement";
import { While } from "./ast/constructs/nodes/statements/while";
import { Extern } from "./ast/constructs/nodes/types/extern";
import { Int } from "./ast/constructs/nodes/types/int";
import { IntegerConstant } from "./ast/constructs/nodes/types/integerConstant";
import { Long } from "./ast/constructs/nodes/types/long";
import { Static } from "./ast/constructs/nodes/types/static";
import { CStorageClass } from "./ast/constructs/cStorageClass";
import { Block } from "./ast/constructs/nodes/core/block";

const DEBUG_MODE = false;

// Lets try and read this.
export class Parser
{
  tokens: string[];
  current: number;
  line_number: number;

  constructor()
  {
    this.tokens = [];
    this.current = 0;
    this.line_number = 0;
  }

  private skipGarbage(): void
  {
    while (
      this.tokens[this.current] == "\n" ||
      this.tokens[this.current] == "//"
    )
    {
      if (this.tokens[this.current] == "\n")
      {
        this.line_number++;
        this.current++;
      } else if (this.tokens[this.current] == "//")
      {
        if (DEBUG_MODE) console.log("Skipping comment...");
        while (
          this.tokens[this.current] != null &&
          this.tokens[this.current] != "\n"
        )
        {
          this.current++;
        }
      }
    }
  }

  isAtEnd(): boolean
  {
    this.skipGarbage();
    return (
      this.current >= this.tokens.length || this.tokens[this.current] == null
    );
  }

  throwError(str: string)
  {
    throw new Error(`Syntax Error: ${str} (Line ${this.line_number})`);
  }

  peek(): string
  {
    this.skipGarbage();
    // if (!this.tokens[this.current]) this.throwError("Malformed.")
    return this.tokens[this.current];
  }

  lookAhead(amount: number): string
  {
    const temp = this.current;

    let token = "";
    for (let x = 0; x != amount; x++)
    {
      this.skipGarbage();
      token = this.consume();
    }
    this.current = temp;

    return token;
  }

  consume(): string
  {
    this.skipGarbage();

    const token = this.tokens[this.current];
    if (DEBUG_MODE) console.log(`Consuming ${token}`);

    this.current++;
    return token;
  }

  parse(tokens: string[]): ASTNode
  {
    this.tokens = tokens;
    this.current = 0;

    // Start parsing. The root is always a 'Program'.
    const root = this._parseProgram();

    if (!this.isAtEnd())
    {
      this.throwError(
        `Unexpected token after program end: '${this.tokens[this.current]}'`
      );
    }

    return root;
  }

  expect(expected: string)
  {
    const token = this.peek();
    if (DEBUG_MODE) console.log(`Expecting ${token} == ${expected} `);
    if (token === expected)
    {
      if (DEBUG_MODE) console.log(` - MATCH, returning ${token} `);
      return this.consume();
    }
    this.throwError(`Expected '${expected}' but got '${token}'`);
  }

  _isType(input: string): boolean
  {
    return ["int", "long"].indexOf(input) != -1;
  }

  _isSpecifier(input: string): boolean
  {
    return this._isType(input) || ["static", "extern"].indexOf(input) != -1;
  }

  //<program> ::= { <declaration> }
  _parseProgram(): CProgram
  {
    this.line_number = 0;

    let items: CDeclaration[] = [];

    let next = this.peek();

    while (this._isSpecifier(next))
    {
      items.push(this._parseDeclaration());
      next = this.peek();
    }

    return new Program(items);
  }

  // <declaration> ::= <variable-declaration> | <function-declaration>
  _parseDeclaration(): CDeclaration
  {
    if (this.peek() == "(")
    {
      return this._parseFunctionDeclaration();
    } else
    {
      return this._parseVariableDeclaration();
    }
  }


  // <variable-declaration> ::= { <specifier> }+ <identifier> [ "=" <exp> ] ";"
  _parseVariableDeclaration(): CDeclaration
  {
    let type: CType | null = null;
    let specifier: CStorageClass | undefined = undefined;

    let next = this.peek();

    // While the next token is still a specifier
    while (this._isSpecifier(next))
    {
      // Grab it
      let cur = this._parseSpecifier();

      // If its a type specifier
      if (this._isType(next))
      {
        if (type == null)
        {
          type = cur;
        } else
        {
          this.throwError(`Multiple types specified`);
        }
      }
      // else add it to the list of specifier
      else if (specifier == null)
      {
        specifier = cur;
      } else
      {
        this.throwError(`Multiple storage classes provided`)
      }
      next = this.peek();
    }

    // Identifier
    const identifier = this.consume();

    if (type != null)
    {
      const next = this.peek();

      if (next == "=")
      {
        this.consume();

        const value = this._parseExpression();

        this.expect(";");

        return new VariableDeclaration(identifier, type, value, specifier);
      } else
      {
        this.expect(";");

        return new VariableDeclaration(identifier, type, undefined, specifier);
      }
    } else
    {
      this.throwError(`Variable type not defined.`)
      return new VariableDeclaration("FAIL", new Int(), new IntegerConstant(0));
    }
  }

  // <function-declaration> ::= { <specifier> }+ <identifier> "(" <param-list> ")" ( <block> | ";") 
  _parseFunctionDeclaration(): CFunction
  {
    let type: CType | null = null;
    let specifier: CStorageClass | undefined = undefined;

    let next = this.peek();

    // While the next token is still a specifier
    while (this._isSpecifier(next))
    {
      // Grab it
      let cur = this._parseSpecifier();

      // If its a type specifier
      if (this._isType(next))
      {
        if (type == null)
        {
          type = cur;
        } else
        {
          this.throwError(`Multiple types specified`);
        }
      }
      // else add it to the list of specifier
      else if (specifier == null)
      {
        specifier = cur;
      } else
      {
        this.throwError(`Multiple storage classes provided`)
      }
      next = this.peek();
    }

    // Identifier
    const identifier = this.consume();

    if (type != null)
    {

      this.expect("(");

      let next = this.peek();

      let params: string[] = [];

      while (next != ")")
      {
        params.push(this.consume());

        next = this.peek();

        if (next == ",")
        {
          this.consume();
          next = this.peek();
        }
      }

      this.expect(")");

      if (this.peek() == ";")
      {
        this.consume();
        return new FunctionDeclaration(identifier, params, type, [], specifier);
      }

      return new FunctionDeclaration(
        identifier,
        params,
        type,
        this._parseBlock(),
        specifier
      );
    } else
    {
      this.throwError(`Function type not defined.`);
      return new FunctionDeclaration("FAIL", [], new Int());
    }
  }

  // <type-specifier> ::= "int" | "long"
  _parseTypeSpecifier(): CType
  {
    const type = this.consume();

    if (type == "int")
    {
      return new Int();
    } else if (type == "long")
    {
      return new Long();
    }
    this.throwError(`Type ${type} unrecognised.`);
    return new Int();
  }

  // <specifier> ::= <type-specifier> | "static" | "extern"
  _parseSpecifier(): CSpecifier 
  {
    const type = this.consume();

    if (type == "static")
    {
      return new Static();
    } else if (type == "extern")
    {
      return new Extern();
    } else
    {
      return this._parseTypeSpecifier();
    }
  }

  // <block> ::= "{" { <block-item> } "}"
  _parseBlock(): Block
  {
    this.expect("{")

    const next = this.peek();

    if (this._isSpecifier(next))
    {
      return this._parseVariableDeclaration();
    } else
    {
      return this._parseStatement();
    }
  }

  _parseBlockItem(): CBlockItem
  {
    const next = this.peek();

    if (this._isSpecifier(next))
    {
      return this._parseVariableDeclaration();
    } else
    {
      return this._parseStatement();
    }
  }

  // <statement> ::= "return" <exp> ";"
  //               | <exp-option> ";"
  //               | "if" "(" <exp> ")" <statement> [ "else" <statement> ]
  //               | "{" { <block-item> } "}
  //               | "for" "(" <exp-option> ";" <exp-option> ";" <exp-option> ")" <statement>
  //               | "for" "(" <declaration> <exp-option> ";" <exp-option> ")" <statement>
  //               | "while" "(" <exp> ")" <statement>
  //               | "do" <statement> "while" "(" <exp> ")" ";"
  //               | "break" ";"
  //               | "continue" ";"
  _parseStatement(): CStatement
  {
    const token = this.peek();

    switch (token)
    {
      // Return statement.
      case "return":
        this.consume();
        const retState = new ReturnStatement(this._parseExpression());
        this.expect(";");
        return retState;

      // Empty expression
      case ";":
        this.consume();
        return new Exp();

      // Conditional
      case "if":
        this.consume();
        this.expect("(");

        const cond_exp = this._parseExpression();

        this.expect(")");

        const cond_statement = this._parseStatement();

        if (this.peek() == "else")
        {
          this.consume();
          return new Conditional(
            cond_exp,
            cond_statement,
            this._parseStatement()
          );
        } else
        {
          return new Conditional(cond_exp, cond_statement);
        }

      // Compound
      case "{":
        this.consume();
        let next = this.peek();
        let blocks = [];

        while (next != "}")
        {
          blocks.push(this._parseBlock());
          next = this.peek();
          if (next == null)
          {
            this.throwError(`Missing }`);
          }
        }

        this.expect("}");

        return new Compound(blocks);

      // For Loop
      case "for":
        this.consume();
        this.expect("(");

        if (this.peek() === "int")
        {
          const decl = this._parseVariableDeclaration();

          let exp_a: CExpression = new IntegerConstant(0);
          if (this.peek() === ";")
          {
            this.consume();
          } else
          {
            exp_a = this._parseExpression();
            this.expect(";");
          }

          let exp_b: Exp = new Exp();
          if (this.peek() === ")")
          {
            this.consume();
          } else
          {
            exp_b = new Exp(this._parseExpression());
            this.expect(")");
          }

          const statem = this._parseStatement();

          return new ForDeclaration(decl, exp_a, exp_b, statem);
        } else
        {
          let init_exp: CExpression = new IntegerConstant(0);
          if (this.peek() === ";")
          {
            this.consume();
          } else
          {
            init_exp = this._parseExpression();
            this.expect(";");
          }

          let cond_exp: CExpression = new IntegerConstant(0);
          if (this.peek() == ";")
          {
            this.consume();
          } else
          {
            cond_exp = this._parseExpression();
            this.expect(";");
          }

          let post_exp: Exp = new Exp();
          if (this.peek() === ")")
          {
            this.consume();
          } else
          {
            post_exp = new Exp(this._parseExpression());
            this.expect(")");
          }

          const statem = this._parseStatement();

          return new For(init_exp, cond_exp, post_exp, statem);
        }

      // While Loop
      case "while":
        this.consume();
        this.expect("(");

        const expr = this._parseExpression();

        this.expect(")");

        const stat = this._parseStatement();

        return new While(expr, stat);

      case "do":
        this.consume();

        const state = this._parseStatement();

        this.expect("while");
        this.expect("(");

        const expre = this._parseExpression();

        this.expect(")");

        this.expect(";");

        return new Do(state, expre);

      case "break":
        this.consume();
        this.expect(";");
        return new Break();

      case "continue":
        this.consume();
        this.expect(";");
        return new Continue();

      // Generic expression.
      default:
        const exp = this._parseExpression();
        this.expect(";");
        return exp;
    }
  }

  // Lower the line number, higher the precidence.
  // <exp> ::= <id> "=" <exp> | <conditional-exp>
  _parseExpression(): CExpression
  {
    const left_exp = this._parseConditionalExpression();

    // Create assignment blocks.
    const assignOps = [
      "=",
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
                        return this._parseFactor();
                        // <term> ::= <factor> { ("*" | "/" | "%") <factor> }
                      }, ["*", "/", "%"]);
                      // <additive-exp> ::= <term> { ("+" | "-") <term> }
                    }, ["+", "-"]);
                    // <bitwise-exp> ::= <additive-exp> { ("<<" | ">>") <additive-exp> }
                  }, ["<<", ">>"]);
                  // <relational-exp> ::= <bitwise-exp> { ("<" | ">" | "<=" | ">=") <bitwise-exp> }
                }, ["<", ">", ">=", "<="]);
                // <equality-exp> ::= Drelational-exp> { ("!=" | "==") <relational-exp> }
              }, ["!=", "=="]);
              // <bitwise-and-exp> ::= <equality-exp> { "&" <equality-exp> }
            }, ["&"]);
            // <bitwise-xor-exp> ::= <bitwise-and-exp> { "^" <bitwise-and-exp> }
          }, ["^"]);
          // <bitwise-or-exp> ::= <bitwise-xor-exp> { "|" <bitwise-xor-exp> }
        }, ["|"]);
        // <logical-and-exp> ::= <equality-exp> { "&&" <equality-exp> }
      }, ["&&"]);
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
      return exp;
    }
  }

  // Lowest precidence expression
  _parseExpressionModular(
    _parse_method: () => CExpression,
    operators: string[]
  ): CExpression
  {
    let expression = _parse_method();
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

  // <function-call> ::= id "(" [ <exp> { "," <exp> } ] ")"
  _parseFunctionCall(id: string): CExpression
  {
    this.expect("(");

    let params: CExpression[] = [];

    let next = this.peek();

    while (next != ")")
    {
      params.push(this._parseExpression());
      next = this.peek();

      if (next == ",")
      {
        this.consume();
        next = this.peek();
      }
    }

    this.expect(")");

    return new FunctionCall(id, params);
  }

  // <factor> ::= <function-call> | "(" <exp> ")" | <unary_op> <factor> | <int> | <id>
  _parseFactor(): CExpression
  {
    const next = this.consume();
    let parsedFactor: CExpression;

    // "(" <exp> ")"
    if (next == "(")
    {
      const exp = this._parseExpression();
      if (this.consume() != ")") this.throwError(`')' expected.`);
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
      parsedFactor = new IntegerConstant(Number(next));
    }
    // <id> OR function call
    else
    {
      if (this.peek() == "(")
      {
        parsedFactor = this._parseFunctionCall(next);
      } else
      {
        parsedFactor = new VariableRef(next);
      }
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
