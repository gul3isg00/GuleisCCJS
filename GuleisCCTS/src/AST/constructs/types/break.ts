import { ASTNode, TreeVisualizerNode } from "../../ASTNode";

export class Break extends ASTNode
{

    constructor()
    {
        super();
    }

    toString(): string
    {
        return `{Break}`;
    }

    toTree(): TreeVisualizerNode
    {
        return {
            name: "Break",
        };
    }

}
