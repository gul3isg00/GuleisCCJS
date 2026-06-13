import { CExpression } from "./cExpression";
import { ForDeclaration } from "./nodes/declarations/forDeclaration";
import { Exp } from "./nodes/expressions/exp";
import { Break } from "./nodes/statements/break";
import { Compound } from "./nodes/statements/compound";
import { Conditional } from "./nodes/statements/conditional";
import { Continue } from "./nodes/statements/continue";
import { Do } from "./nodes/statements/do";
import { For } from "./nodes/statements/for";
import { ReturnStatement } from "./nodes/statements/returnStatement";
import { While } from "./nodes/statements/while";

export type CStatement = ReturnStatement | CExpression | Conditional | Compound | For | ForDeclaration | While | Do | Exp | Break | Continue;
