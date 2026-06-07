import { CExpression } from "./cExpression";
import { Compound } from "./types/compound";
import { Conditional } from "./types/conditional";
import { ReturnStatement } from "./types/returnStatement";

export type CStatement = ReturnStatement | CExpression | Conditional | Compound;