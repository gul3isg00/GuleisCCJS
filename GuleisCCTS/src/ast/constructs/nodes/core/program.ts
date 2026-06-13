import { ASTNode, TreeVisualizerNode } from "../../../ASTNode";
import { CFunction } from "../../cFunction";
import { CTopLevelItem } from "../../cTopLevelItem";

export class Program extends ASTNode
{
  items: CTopLevelItem[];

  constructor(items: CTopLevelItem[])
  {
    super();
    this.items = items;
  }

  toString(): string
  {
    return `(Program | items: ${this.items.map(p => p.toString())})`;
  }

  toTree(): TreeVisualizerNode
  {
    return {
      name: "Program",
      children: this.items.map(p => p.toTree())
    };
  }
}
