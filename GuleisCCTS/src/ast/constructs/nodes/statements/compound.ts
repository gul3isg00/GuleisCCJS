import { ASTNode, TreeVisualizerNode } from "../../../ASTNode";
import { CBlockItem } from "../../cBlockItem";

export class Compound extends ASTNode
{
    blocks: CBlockItem[];

    constructor(blocks: CBlockItem[])
    {
        super();
        this.blocks = blocks;
    }

    toString(): string
    {
        return `[Compound | blocks: ${this.blocks.map(s => s.toString())}]`;
    }

    toTree(): TreeVisualizerNode
    {
        return {
            name: "Compound",
            children: this.blocks.map(b => b.toTree())
        };
    }
}
