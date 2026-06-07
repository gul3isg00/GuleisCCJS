import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { CodeGenerator } from "./codeGenerator";
import { CodeGeneratorLocal } from "./codeGeneratorLocal";

const DEBUG_MODE = false;

export class GuleisCCTS
{
  lexer: Lexer;
  parser: Parser;
  generator: CodeGenerator;

  constructor()
  {
    this.lexer = new Lexer();
    this.parser = new Parser();
    this.generator = new CodeGeneratorLocal("");
  }
  async _compile(rawCode: string)
  {
    try
    {
      if (DEBUG_MODE) console.log(rawCode);

      const tokens = this.lexer.lex(rawCode);
      if (DEBUG_MODE) console.log(tokens);

      if (!tokens) throw new Error("Lexer failed to generate tokens");

      const parsed = this.parser.parse(tokens);
      if (DEBUG_MODE) parsed.print();

      const compiled = this.generator.generate(parsed);

      return {
        success: true,
        tokens: tokens,
        parsed: parsed.toTree(),
        compiled: compiled
      }
    } catch (err: any)
    {
      return {
        success: false,
        error: err.message
      }
    }
  }
}
