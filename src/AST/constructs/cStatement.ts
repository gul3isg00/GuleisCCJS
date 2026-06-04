import { CExpression } from "./cExpression";
import { Declare } from "./types/declare";
import { ReturnStatement } from "./types/returnStatement";

export type CStatement = ReturnStatement | Declare | CExpression;