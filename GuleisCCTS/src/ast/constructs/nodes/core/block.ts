import { ASTNode, TreeVisualizerNode } from "../../../ASTNode";
import { CBlockItem } from "../../cBlockItem";

export class Block extends ASTNode
{
    items?: CBlockItem[];

    constructor(items?: CBlockItem[])
    {
        super();
        this.items = items;
    }

    toString(): string
    {
        return `(Block | items: ${this.items ? this.items.map(p => p.toString()) : ""})`;
    }

    toTree(): TreeVisualizerNode
    {
        return {
            name: "Block",
            children: this.items ? this.items.map(p => p.toTree()) : []
        };
    }
}
