import { ASTNode, TreeVisualizerNode } from "../../../ASTNode";
import { CExpression } from "../../cExpression";
import { CStatement } from "../../cStatement";

export class While extends ASTNode
{
    expression: CExpression;
    statement: CStatement;

    constructor(expression: CExpression, statement: CStatement)
    {
        super();
        this.expression = expression;
        this.statement = statement;
    }

    toString(): string
    {
        return `{While `;
    }

    toTree(): TreeVisualizerNode
    {
        return {
            name: "While",
            children: [this.expression.toTree(), this.statement.toTree()]
        };
    }

}
