import { CExpression } from "./cExpression";
import { Conditional } from "./types/conditional";
import { ReturnStatement } from "./types/returnStatement";

export type CStatement = ReturnStatement | CExpression | Conditional;