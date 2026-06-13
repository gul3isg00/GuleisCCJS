import { ASTNode, TreeVisualizerNode } from "../../../ASTNode";
import { CExpression } from "../../cExpression";
import { CStatement } from "../../cStatement";

export class Do extends ASTNode
{
    expression: CExpression;
    statement: CStatement;

    constructor(statement: CStatement, expression: CExpression)
    {
        super();
        this.expression = expression;
        this.statement = statement;
    }

    toString(): string
    {
        return `{Do `;
    }

    toTree(): TreeVisualizerNode
    {
        return {
            name: "Do",
            children: [this.expression.toTree(), this.statement.toTree()]
        };
    }

}
