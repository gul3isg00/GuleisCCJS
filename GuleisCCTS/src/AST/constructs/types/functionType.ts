import { ASTNode, TreeVisualizerNode } from "../../ASTNode";
import { CExpression } from "../cExpression";
import { CType } from "../cType";

export class FunctionType extends ASTNode
{
    params: CType[];
    ret: CType;

    constructor(params: CType[], ret: CType)
    {
        super();
        this.params = params;
        this.ret = ret;
    }

    toString(): string
    {
        return `(FunctionType | params: ${this.params}, ret: ${this.ret})`;
    }

    toTree(): TreeVisualizerNode
    {
        return {
            name: "FunctionType",
            attributes: { "params": this.params, "ret": this.ret },
        };
    }
}
