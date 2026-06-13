import { ASTNode, TreeVisualizerNode } from "../../../ASTNode";
import { CExpression } from "../../cExpression";
import { CStorageClass } from "../../cStorageClass";
import { CType } from "../../cType";

export class Declare extends ASTNode
{
  str: string;
  expression?: CExpression;
  storageClass?: CStorageClass
  type: CType

  constructor(str: string, type: CType, expression?: CExpression, storage_class?: CStorageClass)
  {
    super();
    this.str = str;
    this.type = type;
    this.expression = expression;
    this.storageClass = storage_class;
  }

  toString(): string
  {
    return `(Declare | str: ${this.str}, type: ${this.type}, expression: ${this.expression?.toString()}), storageClass: ${this.storageClass?.toString()}`;
  }

  toTree(): TreeVisualizerNode
  {
    return {
      name: "Declare",
      attributes: { "str": this.str },
      children: [this.type.toTree()].concat(this.expression ? [this.expression.toTree()] : []).concat(this.storageClass ? [this.storageClass.toTree()] : [])
    };
  }
}
