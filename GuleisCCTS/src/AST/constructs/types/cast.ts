import { ASTNode, TreeVisualizerNode } from "../../ASTNode";
import { CExpression } from "../cExpression";
import { CType } from "../cType";

export class Cast extends ASTNode
{
    type: CType;
    expression: CExpression;

    constructor(type: CType, expression: CExpression)
    {
        super();
        this.type = type;
        this.expression = expression;
    }

    toString(): string
    {
        return `(Cast | string: ${this.type}, expression: ${this.expression})`;
    }

    toTree(): TreeVisualizerNode
    {
        return {
            name: "Cast",
            attributes: { "type": this.type },
            children: [this.expression.toTree()]
        };
    }
}
