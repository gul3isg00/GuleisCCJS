import { GuleisCCTS } from "./compiler";

// For web based execution of the compiler.
export class GuleisCCTSWeb extends GuleisCCTS
{
    constructor()
    {
        super();
    }


    async compile(input: string)
    {
        await this._compile(input)
    }

}