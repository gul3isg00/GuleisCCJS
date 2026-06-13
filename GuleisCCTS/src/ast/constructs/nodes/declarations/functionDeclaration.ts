import { ASTNode, TreeVisualizerNode } from "../../../ASTNode";
import { CBlockItem } from "../../cBlockItem";
import { CStorageClass } from "../../cStorageClass";
import { CType } from "../../cType";

export class FunctionDeclaration extends ASTNode
{
  name: string;
  params: string[];
  type: CType;
  blocks?: CBlockItem[];
  storageClass?: CStorageClass;

  constructor(name: string, params: string[], type: CType, blocks?: CBlockItem[], storageClass?: CStorageClass)
  {
    super();
    this.name = name;
    this.params = params;
    this.type = type;
    this.blocks = blocks;
    this.storageClass = storageClass;
  }

  toString(): string
  {
    return `[Function Declaration | name: ${this.name}, blocks: ${this.blocks ? this.blocks.map(b => b.toString()) : []}, params: ${this.params}, storageClass: ${this.storageClass}]`;
  }

  toTree(): TreeVisualizerNode
  {
    return {
      name: "FunctionDeclaration",
      attributes: { "name": this.name, "params": this.params },
      children: [this.type.toTree()].concat(this.blocks ? this.blocks.map(b => b.toTree()) : []).concat(this.storageClass ? [this.storageClass.toTree()] : [])
    }
  }
}
