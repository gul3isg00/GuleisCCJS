import fs from "fs";
import { CodeGenerator } from "./codeGenerator";
import { exec } from 'child_process';
import { promisify } from 'util';
import { GuleisCCTS } from "./compiler";
import { CodeGeneratorLocal } from "./codeGeneratorLocal";

const execAsync = promisify(exec);

// Necessary for the test script to run properly.
const COMPILE_TO_MACHINE_CODE = true;

// For local execution of the compiler.
export class GuleisCCTSLocal extends GuleisCCTS
{
    source: string;

    constructor(source_file: string)
    {
        super();
        this.source = source_file ?? "";
        this.generator = new CodeGeneratorLocal(this.source);
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

    async _assembly_to_machine_code(source_file?: string)
    {
        const source = source_file ?? this.source;
        await execAsync(`gcc ${source} -o ${source.replace(".c", "")}`);
    }

    async compile()
    {
        if (this.source)
        {
            await this._compile(this.read_file(this.source))
            if (COMPILE_TO_MACHINE_CODE) await this._assembly_to_machine_code(this.source);
        } else
        {
            throw new Error(`Configuration Error: No source file specified.`)
        }
    }

}