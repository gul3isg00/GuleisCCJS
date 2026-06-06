import { Assign } from "./types/assign";
import { BinOp } from "./types/binOp";
import { Constant } from "./types/constant";
import { UnOp } from "./types/unop";
import { VariableRef } from "./types/variable_Ref";

export type CExpression = Assign | VariableRef | UnOp | Constant | BinOp;