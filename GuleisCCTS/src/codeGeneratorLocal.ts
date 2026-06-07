import { ASTNode } from "./AST/ASTNode";
import { CProgram } from "./AST/constructs/cProgram";
import { CodeGenerator } from "./codeGenerator";
import fs from "fs"

export class CodeGeneratorLocal extends CodeGenerator
{
    save_location: string;
    constructor(save_location: string)
    {
        super();
        this.save_location = save_location.replace(".c", ".s");
    }

    emit(input: string)
    {
        fs.appendFileSync(this.save_location, input + "\n");
    }

    generate(input: ASTNode): string
    {
        fs.writeFileSync(this.save_location, "");
        this._generateProgram(input as CProgram);
        return "Saved";
    }
}
