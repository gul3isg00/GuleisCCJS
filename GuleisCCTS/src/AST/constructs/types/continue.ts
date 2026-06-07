import { ASTNode, TreeVisualizerNode } from "../../ASTNode";

export class Continue extends ASTNode
{

    constructor()
    {
        super();
    }

    toString(): string
    {
        return `{Continue `;
    }

    toTree(): TreeVisualizerNode
    {
        return {
            name: "Continue",
        };
    }

}
