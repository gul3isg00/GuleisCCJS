import { ASTNode } from "../../ASTNode";
import { CExpression } from "../cExpression";
import { CStatement } from "../cStatement";

export class Conditional extends ASTNode
{
    expression: CExpression;
    if_statement: CStatement;
    else_statement?: CStatement;

    constructor(expression: CExpression, if_statement: CStatement, else_statement?: CStatement)
    {
        super();
        this.expression = expression;
        this.if_statement = if_statement;
        this.else_statement = else_statement;
    }

    toString(): string
    {
        return `{Conditional | expression: ${this.expression.toString()}, if: ${this.if_statement.toString()}, else: ${this.else_statement?.toString()}}`;
    }
}
