import { ASTNode, TreeVisualizerNode } from "../../ASTNode";
import { CExpression } from "../cExpression";
import { CStatement } from "../cStatement";

export class Exp extends ASTNode
{
    expression?: CExpression;

    constructor(expression?: CExpression)
    {
        super();
        this.expression = expression;
    }

    toString(): string
    {
        return `{Exp `;
    }

    toTree(): TreeVisualizerNode
    {
        return {
            name: "Exp",
            children: this.expression ? [this.expression.toTree()] : []
        };
    }

}
