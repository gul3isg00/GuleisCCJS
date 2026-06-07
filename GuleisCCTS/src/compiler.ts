import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { CodeGenerator } from "./codeGenerator";

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
    this.generator = new CodeGenerator("");
  }

  async _compile(rawCode: string)
  {
    if (DEBUG_MODE) console.log(rawCode);

    const tokens = this.lexer.lex(rawCode);

    if (DEBUG_MODE) console.log(tokens);


    if (tokens)
    {
      const parsed = this.parser.parse(tokens);

      if (DEBUG_MODE) parsed.print();

      this.generator.generate(parsed);
    }
  }
}
