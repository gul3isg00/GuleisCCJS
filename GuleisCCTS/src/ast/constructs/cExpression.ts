import { Assign } from "./nodes/expressions/assign";
import { BinOp } from "./nodes/binOp";
import { ConditionalExpression } from "./nodes/conditionalExpression";
import { IntegerConstant } from "./nodes/types/integerConstant";
import { FunctionCall } from "./nodes/expressions/functionCall";
import { UnOp } from "./nodes/unop";
import { VariableRef } from "./nodes/variableRef";

export type CExpression = Assign | VariableRef | UnOp | IntegerConstant | BinOp | ConditionalExpression | FunctionCall;
