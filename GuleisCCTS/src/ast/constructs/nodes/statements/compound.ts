import { ASTNode, TreeVisualizerNode } from "../../../ASTNode";
import { CBlock } from "../../cBlock";

export class Compound extends ASTNode
{
    blocks: CBlock[];

    constructor(blocks: CBlock[])
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
