import { Assign } from "./types/assign";
import { BinOp } from "./types/binOp";
import { ConditionalExpression } from "./types/conditionalExpression";
import { Constant } from "./types/constant";
import { FunctionCall } from "./types/functionCall";
import { UnOp } from "./types/unop";
import { VariableRef } from "./types/variable_Ref";

export type CExpression = Assign | VariableRef | UnOp | Constant | BinOp | ConditionalExpression | FunctionCall;