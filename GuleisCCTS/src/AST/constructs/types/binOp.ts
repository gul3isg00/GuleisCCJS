import { ASTNode } from "../../ASTNode";
import { CExpression } from "../cExpression";

const ALLOWED_OPERATORS = ["%", "&", "|", "^", "<<", ">>", "+", "-", "/", "*", "==", "!=", "&&", "||", "<=", ">=", ">", "<", "+=", "-=", "/=", "*=", "%=", "<<=", ">>=", "&=", "|=", "^=", ","];

export class BinOp extends ASTNode
{
    binary_operator: string;
    expression_a: CExpression;
    expression_b: CExpression;

    constructor(binary_operator: string, expression_a: CExpression, expression_b: CExpression)
    {
        super();
        if (binary_operator.length < 1 || binary_operator.length > 3 || ALLOWED_OPERATORS.indexOf(binary_operator) == -1)
        {
            throw new Error(
                `Syntax Error: Expected Binary Operator but got '${binary_operator}'`,
            );
        }
        this.binary_operator = binary_operator;
        this.expression_a = expression_a;
        this.expression_b = expression_b;
    }

    toString(): string
    {
        return `<BinOp | binary_operator: ${this.binary_operator}, expression_a: ${this.expression_a.toString()}, expression_b: ${this.expression_b.toString()}>`;
    }
}