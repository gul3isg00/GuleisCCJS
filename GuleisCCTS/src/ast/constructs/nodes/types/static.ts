import { ASTNode, TreeVisualizerNode } from "../../../ASTNode";

export class Static extends ASTNode
{

    constructor()
    {
        super();
    }

    toString(): string
    {
        return `{Static}`;
    }

    toTree(): TreeVisualizerNode
    {
        return {
            name: "Static",
        };
    }

}
