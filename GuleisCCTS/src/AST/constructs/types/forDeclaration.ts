import { ASTNode, TreeVisualizerNode } from "../../ASTNode";
import { CDeclaration } from "../cDeclaration";
import { CExpression } from "../cExpression";
import { CStatement } from "../cStatement";
import { Exp } from "./exp";

export class ForDeclaration extends ASTNode
{
    initial_declaration: CDeclaration;
    condition: CExpression;
    post_exp: Exp;
    body: CStatement;

    constructor(initial_declaration: CDeclaration, condition: CExpression, post_exp: Exp, body: CStatement)
    {
        super();
        this.initial_declaration = initial_declaration;
        this.condition = condition;
        this.post_exp = post_exp;
        this.body = body
    }

    toString(): string
    {
        return `{ForDeclaration | }`;
    }

    toTree(): TreeVisualizerNode
    {
        return {
            name: "ForDeclaration",
            children: [this.initial_declaration.toTree(), this.condition.toTree(), this.post_exp.toTree(), this.body.toTree()]
        };
    }
}
