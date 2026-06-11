import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { CodeGenerator } from "./codeGenerator";
import { CodeGeneratorLocal } from "./codeGeneratorLocal";
import { SemanticAnalyser } from "./semanticAnalyser";
import { IntegerConstant } from "./AST/constructs/types/integerConstant";
import { ASTNode } from "./AST/ASTNode";

const DO_CODE_GENERATION = true;
const DO_SEMANTIC_ANALYSIS = true;

export class GuleisCCTS
{
  lexer: Lexer;
  parser: Parser;
  generator: CodeGenerator;
  semanticAnalyser: SemanticAnalyser;

  DEBUG_MODE: boolean = false;

  constructor()
  {
    this.lexer = new Lexer();
    this.parser = new Parser();
    this.semanticAnalyser = new SemanticAnalyser();
    this.generator = new CodeGeneratorLocal("");
  }
  async _compile(rawCode: string)
  {
    try
    {
      if (this.DEBUG_MODE) console.log(rawCode);

      const tokens = this.lexer.lex(rawCode);
      if (this.DEBUG_MODE) console.log(tokens);

      if (!tokens) throw new Error("Lexer failed to generate tokens");

      const parsed = this.parser.parse(tokens);
      if (this.DEBUG_MODE) parsed.print();

      let analysed: { ast: ASTNode; symbols: any } = {
        ast: new IntegerConstant(1),
        symbols: { functions: [] },
      };

      if (DO_SEMANTIC_ANALYSIS)
        analysed = this.semanticAnalyser.analyse(parsed);

      let compiled = "Assembly Code Generation disabled.";

      if (DO_CODE_GENERATION) compiled = this.generator.generate(analysed.ast);

      return {
        success: true,
        tokens: tokens,
        parsed: parsed.toTree(),
        symbols: analysed.symbols,
        compiled: compiled,
      };
    } catch (err: any)
    {
      return {
        success: false,
        error: err.message,
      };
    }
  }
}
