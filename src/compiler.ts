import fs from "fs";
import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { CodeGenerator } from "./codeGenerator";
import { exec } from 'child_process';
import { promisify } from 'util';


const execAsync = promisify(exec);

const DEBUG_MODE = false;

export class GuleisCCJS
{
  source: string;
  lexer: Lexer;
  parser: Parser;
  generator: CodeGenerator;

  constructor(source_file?: string)
  {
    this.source = source_file ?? "";
    this.lexer = new Lexer();
    this.parser = new Parser();
    this.generator = new CodeGenerator(this.source);
  }

  read_file(source_file?: string): string
  {
    const source = source_file ?? this.source;
    try
    {
      const data = fs.readFileSync(source, "utf8");
      return data;
    } catch (err)
    {
      throw err;
    }
  }

  async assembly_to_machine_code(source_file?: string)
  {
    const source = source_file ?? this.source;

    await execAsync(`gcc ${source} -o ${source.replace(".c", "")}`);

  }

  async compile()
  {
    const rawCode = this.read_file(this.source);

    if (DEBUG_MODE) console.log(rawCode);

    const tokens = this.lexer.lex(rawCode);

    if (DEBUG_MODE) console.log(tokens);


    if (tokens)
    {
      const parsed = this.parser.parse(tokens);

      if (DEBUG_MODE) parsed.print();

      this.generator.generate(parsed);

      await this.assembly_to_machine_code(this.source);
    }
  }
}
