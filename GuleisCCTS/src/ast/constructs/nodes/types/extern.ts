import { ASTNode, TreeVisualizerNode } from "../../../ASTNode";

export class Extern extends ASTNode
{

    constructor()
    {
        super();
    }

    toString(): string
    {
        return `{Extern}`;
    }

    toTree(): TreeVisualizerNode
    {
        return {
            name: "Extern",
        };
    }

}
