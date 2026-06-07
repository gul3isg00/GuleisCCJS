import { ASTNode } from "./AST/ASTNode";
import { CProgram } from "./AST/constructs/cProgram";
import { CodeGenerator } from "./codeGenerator";

export class CodeGeneratorWeb extends CodeGenerator
{
    output: string;

    constructor()
    {
        super();
        this.output = "";
    }

    emit(input: string): void
    {
        this.output += input + "\n";
    }

    generate(input: ASTNode): void
    {
        this.output = "";
        this._generateProgram(input as CProgram);
    }
}
