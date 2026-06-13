import { CExpression } from "./cExpression";
import { Break } from "./nodes/break";
import { Compound } from "./nodes/compound";
import { Conditional } from "./nodes/conditional";
import { Continue } from "./nodes/statements/continue";
import { Do } from "./nodes/statements/do";
import { Exp } from "./nodes/expressions/exp";
import { For } from "./nodes/for";
import { ForDeclaration } from "./nodes/forDeclaration";
import { ReturnStatement } from "./nodes/returnStatement";
import { While } from "./nodes/while";

export type CStatement = ReturnStatement | CExpression | Conditional | Compound | For | ForDeclaration | While | Do | Exp | Break | Continue;
