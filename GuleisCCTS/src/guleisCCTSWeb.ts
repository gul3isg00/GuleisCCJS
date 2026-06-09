import { CodeGeneratorWeb } from "./codeGeneratorWeb";
import { GuleisCCTS } from "./compiler";

// For web based execution of the compiler (simply returns the compiled file).
export class GuleisCCTSWeb extends GuleisCCTS
{
    constructor()
    {
        super();
        this.generator = new CodeGeneratorWeb();
        this.DEBUG_MODE = true;
    }


    async compile(input: string)
    {
        return await this._compile(input)
    }

}