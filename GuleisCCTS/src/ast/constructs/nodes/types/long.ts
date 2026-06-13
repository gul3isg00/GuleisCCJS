import { ASTNode, TreeVisualizerNode } from "../../../ASTNode";

export class Long extends ASTNode
{
    constructor()
    {
        super();
    }

    toString(): string
    {
        return `{Long}`;
    }

    toTree(): TreeVisualizerNode
    {
        return {
            name: "Long",
        };
    }

}
