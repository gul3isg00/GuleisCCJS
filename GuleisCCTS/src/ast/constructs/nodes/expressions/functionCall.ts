import { ASTNode, TreeVisualizerNode } from "../../../ASTNode";
import { CExpression } from "../../cExpression";

export class FunctionCall extends ASTNode
{
    name: string;
    params: CExpression[];

    constructor(name: string, params: CExpression[])
    {
        super();
        this.name = name;
        this.params = params;
    }

    toString(): string
    {
        return `(FunctionCall | string: ${this.name}, params: ${this.params.map(p => p.toString())})`;
    }

    toTree(): TreeVisualizerNode
    {
        return {
            name: "FunctionCall",
            attributes: { "name": this.name },
            children: this.params.map(p => p.toTree())
        };
    }
}
