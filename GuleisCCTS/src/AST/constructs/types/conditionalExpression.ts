import { ASTNode, TreeVisualizerNode } from "../../ASTNode";
import { CExpression } from "../cExpression";
import { CStatement } from "../cStatement";

export class ConditionalExpression extends ASTNode
{
    condition: CExpression;
    if_statement: CExpression;
    else_statement: CExpression;

    constructor(condition: CExpression, if_statement: CExpression, else_statement: CExpression)
    {
        super();
        this.condition = condition;
        this.if_statement = if_statement;
        this.else_statement = else_statement;
    }

    toString(): string
    {
        return `{ConditionalExpression | condition: ${this.condition.toString()}, if: ${this.if_statement.toString()}, else: ${this.else_statement?.toString()}}`;
    }

    toTree(): TreeVisualizerNode
    {
        return {
            name: "ConditionalExpression",
            children: [this.condition.toTree(), this.if_statement.toTree(), this.else_statement.toTree()]
        };
    }
}
