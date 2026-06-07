import { ASTNode, TreeVisualizerNode } from "../../ASTNode";
import { CExpression } from "../cExpression";
import { CStatement } from "../cStatement";
import { Exp } from "./exp";

export class For extends ASTNode
{
    initial_exp: Exp;
    condition: CExpression;
    post_exp: Exp;
    body: CStatement;

    constructor(initial_exp: Exp, condition: CExpression, post_exp: Exp, body: CStatement)
    {
        super();
        this.initial_exp = initial_exp;
        this.condition = condition;
        this.post_exp = post_exp;
        this.body = body
    }

    toString(): string
    {
        return `{For | }`;
    }

    toTree(): TreeVisualizerNode
    {
        return {
            name: "For",
            children: [this.initial_exp.toTree(), this.condition.toTree(), this.post_exp.toTree(), this.body.toTree()]
        };
    }
}
