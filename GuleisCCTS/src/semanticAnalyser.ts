import { ASTNode } from "./ast/ASTNode";
import { CBlockItem } from "./ast/constructs/cBlockItem";
import { CExpression } from "./ast/constructs/cExpression";
import { CProgram } from "./ast/constructs/cProgram";
import { CStatement } from "./ast/constructs/cStatement";
import { VariableDeclaration } from "./ast/constructs/nodes/declarations/variableDeclaration";
import { ForDeclaration } from "./ast/constructs/nodes/declarations/forDeclaration";
import { FunctionDeclaration } from "./ast/constructs/nodes/declarations/functionDeclaration";
import { Assign } from "./ast/constructs/nodes/expressions/assign";
import { BinOp } from "./ast/constructs/nodes/expressions/binOp";
import { ConditionalExpression } from "./ast/constructs/nodes/expressions/conditionalExpression";
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
import { IntegerConstant } from "./ast/constructs/nodes/types/integerConstant";

class FunctionSignature
{
  constructor(public params: string[], public hasBody: boolean) { }
}

export class SemanticAnalyser
{
  private scopes: Set<string>[] = [new Set()];
  private declared: { [key: string]: boolean } = {};

  private functions: Map<string, FunctionSignature> = new Map();
  private loopDepth: number = 0;

  analyse(input: ASTNode): { ast: ASTNode; symbols: any }
  {
    if (input.constructor.name == "Program")
    {
      this.visitProgram(input as CProgram);
    } else
    {
      throw new Error("AST root must be a Program");
    }

    return {
      ast: input,
      symbols: {
        functions: Array.from(this.functions.entries()).map(([name, sig]) => ({
          name,
          params: sig.params,
          hasBody: sig.hasBody,
        })),
      },
    };
  }

  private enterScope()
  {
    this.scopes.push(new Set());
  }

  private exitScope()
  {
    this.scopes.pop();
  }

  private variableExistsInScope(name: string)
  {
    const currentScope = this.scopes[this.scopes.length - 1];
    return currentScope.has(name);
  }

  private declareVariable(name: string, hasInitialiser: boolean)
  {
    const currentScope = this.scopes[this.scopes.length - 1];
    const isGlobalScope = this.scopes.length == 1;

    if (currentScope.has(name))
    {
      // GLOBAL SCOPE
      if (isGlobalScope)
      {
        // IF DECLARED AND NOT TENTATIVE.
        if (this.declared[name] && hasInitialiser)
        {
          throw new Error(
            `Semantic Error: Global variable '${name}' initialized more than once.`
          );
        }

        // WAS TENTATIVE = NOW ITS NOT
        if (hasInitialiser)
        {
          this.declared[name] = true;
        }
      } else
      {
        // LOCAL SCOPE
        throw new Error(
          `Semantic Error: Variable '${name}' defined more than once in this scope.`
        );
      }
    } else
    {
      currentScope.add(name);
      this.declared[name] = hasInitialiser;
    }
  }

  private checkVariableExists(name: string)
  {
    for (let i = this.scopes.length - 1; i >= 0; i--)
    {
      if (this.scopes[i].has(name)) return;
    }
    throw new Error(`Semantic Error: Undeclared identifier '${name}'`);
  }

  private visitProgram(prog: CProgram)
  {
    prog.items.forEach((item) =>
    {
      if (item instanceof FunctionDeclaration)
      {
        const func = item as FunctionDeclaration;
        const isDefinition = func.blocks != undefined;

        if (this.variableExistsInScope(func.name))
          throw new Error(
            `Semantic Error: ${func.name} cannot be redefined as a function.`
          );

        if (this.functions.has(func.name))
        {
          const existing = this.functions.get(func.name)!;

          if (existing.params.length !== func.params.length)
          {
            throw new Error(
              `Semantic Error: Declaration mismatch for function ${func.name}. Expected ${existing.params.length} parameters, got ${func.params.length}.`
            );
          }

          if (existing.hasBody && isDefinition)
          {
            throw new Error(
              `Semantic Error: Function ${func.name} defined twice.`
            );
          }

          if (isDefinition)
          {
            existing.hasBody = true;
            this.visitFunction(func);
          }
        } else
        {
          this.functions.set(
            func.name,
            new FunctionSignature(func.params, isDefinition)
          );

          this.visitFunction(func);
        }
      } else if (item instanceof VariableDeclaration)
      {
        const dec = item as VariableDeclaration;

        if (this.functions.get(dec.str) != null)
          throw new Error(
            `Semantic Error: ${dec.str} cannot be redefined as a variable.`
          );

        if (item.expression != null && !(item.expression instanceof IntegerConstant))
        {
          throw new Error(
            `Semantic Error: Initialisier expression for ${dec.str} is not a constant.`
          );
        }
        this.declareVariable(dec.str, item.expression != null);
      }
    });

    // prog.items.forEach((item) => {
    //   if (item instanceof FunctionDeclaration) {
    //     const func = item as FunctionDeclaration;
    //     if (func.blocks != undefined) {
    //       this.visitFunction(func);
    //     }
    //   }
    // });
  }

  private visitFunction(func: FunctionDeclaration)
  {
    this.enterScope();

    func.params.forEach((param) => this.declareVariable(param, true));

    if (func.blocks)
    {
      func.blocks.forEach((block) => this.visitBlock(block));
    }

    this.exitScope();
  }
  private visitBlock(block: CBlockItem)
  {
    if (block instanceof VariableDeclaration)
    {
      this.visitDeclaration(block);
    } else
    {
      this.visitStatement(block as CStatement);
    }
  }

  private visitDeclaration(decl: VariableDeclaration)
  {
    if (decl.expression)
    {
      this.visitExpression(decl.expression);
    }
    this.declareVariable(decl.str, decl.expression != null);
  }

  private visitStatement(stmt: CStatement)
  {
    if (stmt instanceof Compound)
    {
      this.enterScope();
      stmt.blocks.forEach((b) => this.visitBlock(b));
      this.exitScope();
    } else if (stmt instanceof ReturnStatement)
    {
      this.visitExpression(stmt.expression);
    } else if (stmt instanceof While || stmt instanceof Do)
    {
      this.visitExpression(stmt.expression);
      this.loopDepth++;
      this.visitStatement(stmt.statement);
      this.loopDepth--;
    } else if (stmt instanceof For || stmt instanceof ForDeclaration)
    {
      this.enterScope();
      if (stmt instanceof ForDeclaration)
        this.visitDeclaration(stmt.initial_declaration);
      else this.visitStatement(stmt.initial_exp); // Exp

      this.visitExpression(stmt.condition);

      this.loopDepth++;
      this.visitStatement(stmt.body);
      this.loopDepth--;

      this.visitStatement(stmt.post_exp); // Exp
      this.exitScope();
    } else if (stmt instanceof Break)
    {
      if (this.loopDepth == 0)
        throw new Error("Semantic Error: Break called outside of loop.");
    } else if (stmt instanceof Continue)
    {
      if (this.loopDepth == 0)
        throw new Error("Semantic Error: Continue called outside of loop.");
    } else if (stmt instanceof Conditional)
    {
      this.visitExpression(stmt.expression);
      this.visitStatement(stmt.if_statement);
      if (stmt.else_statement)
      {
        this.visitStatement(stmt.else_statement);
      }
    } else if (stmt.constructor.name == "Exp" && (stmt as any).expression)
    {
      this.visitExpression((stmt as any).expression);
    } else
    {
      this.visitExpression(stmt as CExpression);
    }
  }

  private visitExpression(expr: CExpression)
  {
    if (expr instanceof Assign)
    {
      this.checkVariableExists(expr.str);
      this.visitExpression(expr.expression);
    } else if (expr instanceof VariableRef)
    {
      this.checkVariableExists(expr.str);
    } else if (expr instanceof FunctionCall)
    {
      const signature = this.functions.get(expr.name);
      if (!signature)
        throw new Error(`Semantic Error: Function ${expr.name} doesn't exist.`);
      if (signature.params.length != expr.params.length)
      {
        throw new Error(
          `Semantic Error: Bad parameters for function ${expr.name}. Expected ${signature.params.length}, got ${expr.params.length}.`
        );
      }
      expr.params.forEach((p) => this.visitExpression(p));
    } else if (expr instanceof BinOp)
    {
      this.visitExpression(expr.expression_a);
      this.visitExpression(expr.expression_b);
    } else if (expr instanceof UnOp)
    {
      this.visitExpression(expr.expression);
    } else if (expr instanceof ConditionalExpression)
    {
      this.visitExpression(expr.condition);
      this.visitExpression(expr.if_statement);
      this.visitExpression(expr.else_statement);
    }
  }
}
