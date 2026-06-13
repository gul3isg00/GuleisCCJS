import { ASTNode, TreeVisualizerNode } from "../../../ASTNode";

export class Int extends ASTNode
{
    constructor()
    {
        super();
    }

    toString(): string
    {
        return `{Int}`;
    }

    toTree(): TreeVisualizerNode
    {
        return {
            name: "Int",
        }
    }

}
