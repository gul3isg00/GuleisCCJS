import { Assign } from "./types/assign";
import { BinOp } from "./types/binOp";
import { ConditionalExpression } from "./types/conditionalExpression";
import { IntegerConstant } from "./types/integerConstant";
import { FunctionCall } from "./types/functionCall";
import { UnOp } from "./types/unop";
import { VariableRef } from "./types/variableRef";

export type CExpression = Assign | VariableRef | UnOp | IntegerConstant | BinOp | ConditionalExpression | FunctionCall;
